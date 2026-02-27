/**
 * damage_system.js — 데미지 처리 시스템
 *
 * 책임: 공격/방어 관련 순수 전투 로직
 * - dealDamage, dealDamageAll: 적 대상 데미지
 * - addShield, takeDamage: 플레이어 방어/피해
 * - applyEnemyStatus: 적 상태이상
 * - getEnemyIntent: 적 의도 조회
 */

import { ParticleSystem } from '../../engine/particles.js';
import { ScreenShake } from '../../engine/screenshake.js';
import { HitStop } from '../../engine/hitstop.js';
import { AudioEngine } from '../../engine/audio.js';
import { EventBus } from '../core/event_bus.js';
import { Actions } from '../core/state_actions.js';
import { Logger } from '../utils/logger.js';

const _getDoc = (deps) => deps?.doc || document;
const _getWin = (deps) => deps?.win || window;

export const DamageSystem = {
    dealDamage(amount, targetIdx = null, noChain = false, deps = {}) {
        const doc = _getDoc(deps);
        const win = _getWin(deps);

        Logger.debug('[dealDamage] Called with targetIdx:', targetIdx, '_selectedTarget:', this._selectedTarget);
        Logger.debug('[dealDamage] Enemies:', this.combat.enemies.map(e => ({ name: e.name, hp: e.hp })));

        if (targetIdx === null) {
            const sel = this._selectedTarget;
            if (sel !== null && sel !== undefined && this.combat.enemies[sel]?.hp > 0) {
                targetIdx = sel;
                Logger.debug('[dealDamage] Using _selectedTarget:', targetIdx);
            } else {
                targetIdx = this.combat.enemies.findIndex(e => e.hp > 0);
                Logger.debug('[dealDamage] Using first alive enemy:', targetIdx);
                if (targetIdx < 0) return 0;
            }
        }
        const enemy = this.combat.enemies[targetIdx];
        if (!enemy || enemy.hp <= 0) return 0;

        let dmg = amount;
        const mom = this.getBuff('momentum');
        if (mom) dmg += mom.dmgBonus || 0;
        const sha = this.getBuff('shadow_atk');
        if (sha) { dmg += sha.dmgBonus || 0; delete this.player.buffs['shadow_atk']; }
        if (this.getBuff('vanish')) {
            dmg = Math.floor(dmg * 2);
            delete this.player.buffs['vanish'];
            this.addLog('💥 크리티컬!', 'echo');
        }
        if (enemy.statusEffects?.immune > 0) {
            this.addLog(`🏛️ ${enemy.name}은(는) 무적 상태!`, 'echo');
            return 0;
        }
        if (enemy.statusEffects?.dodge > 0) {
            this.addLog(`💨 ${enemy.name}이(가) 공격을 강회피했습니다!`, 'system');
            enemy.statusEffects.dodge--;
            if (enemy.statusEffects.dodge <= 0) delete enemy.statusEffects.dodge;
            return 0;
        }
        if ((this.getBuff('weakened')?.stacks || 0) > 0) {
            dmg = Math.max(0, Math.floor(dmg * 0.5));
        }

        const itemScaled = this.triggerItems('deal_damage', dmg);
        if (typeof itemScaled === 'number' && Number.isFinite(itemScaled)) {
            dmg = Math.max(0, Math.floor(itemScaled));
        }
        if (this.player.echoChain > 0) {
            const chainScaled = this.triggerItems('chain_dmg', dmg);
            if (typeof chainScaled === 'number' && Number.isFinite(chainScaled)) {
                dmg = Math.max(0, Math.floor(chainScaled));
            }
        }

        const prevHp = enemy.hp;
        const isCrit = (dmg > prevHp * 0.3) || (typeof this.getBuff === 'function' && this._lastCrit);

        // 상태값 변경 및 EventBus 이벤트 발생(이펙트/UI 갱신 트리거)
        const result = this.dispatch(Actions.ENEMY_DAMAGE, { amount: dmg, targetIdx, isCrit });

        // 가시 반격 처리
        if (enemy.statusEffects?.thorns > 0) {
            const thornsAmt = enemy.statusEffects.thorns;
            if (typeof this.addLog === 'function') this.addLog(`🌵 ${enemy.name}: 가시 반격!`, 'damage');
            this.takeDamage(thornsAmt, deps);
        }

        if (!noChain) {
            this.player.echoChain++;
            this.addEcho(10, true);
            const win = _getWin(deps);
            const updateChainUI = deps.updateChainUI || win.updateChainUI;
            if (typeof updateChainUI === 'function') updateChainUI();
        }

        const finalDmg = result?.actualDamage ?? dmg;
        if (typeof this.addLog === 'function') this.addLog(`⚔️ ${enemy.name}에게 ${finalDmg} 피해!`, 'damage');
        this.markDirty('enemies');

        // 다중 공격 등에서 DOM 즉각 갱신 보장
        // window 폴백 참조 제거, 순수 DI 의존성으로만 접근
        if (typeof deps?.updateStatusDisplay === 'function') {
            deps.updateStatusDisplay();
        }

        if (result && result.isDead && typeof this.onEnemyDeath === 'function') {
            this.onEnemyDeath(enemy, targetIdx, deps);
        }

        return finalDmg;
    },

    dealDamageAll(amount, noChain = false, deps = {}) {
        const alive = this.combat.enemies.map((_, i) => i).filter(i => this.combat.enemies[i].hp > 0);
        alive.forEach((i, idx) => {
            this.dealDamage(amount, i, noChain || (idx < alive.length - 1), deps);
        });
    },

    addShield(amount, deps = {}) {
        let actual = amount;
        if (this.runConfig?.curse === 'fatigue' || this.meta?.runConfig?.curse === 'fatigue') {
            actual = Math.max(0, amount - 10);
            if (actual < amount && typeof this.addLog === 'function') this.addLog('📉 피로의 저주: 방어막 획득 감소 (-10)', 'system');
        }

        this.dispatch(Actions.PLAYER_SHIELD, { amount: actual });
        if (typeof this.addLog === 'function') this.addLog(`🛡️ 방어막 +${actual}`, 'system');
    },

    takeDamage(amount, deps = {}) {
        if (amount <= 0) return;

        if (typeof this.getBuff === 'function' && this.getBuff('immune')) {
            if (typeof this.addLog === 'function') this.addLog('🏛️ 면역으로 피해 무효!', 'echo');
            return;
        }

        let dmg = amount;
        if ((this.getBuff?.('vulnerable')?.stacks || 0) > 0) {
            dmg = Math.floor(dmg * 1.5);
            if (typeof this.addLog === 'function') this.addLog('💢 취약: 피해량 증가!', 'damage');
        }

        const itemScaled = typeof this.triggerItems === 'function' ? this.triggerItems('damage_taken', dmg) : dmg;
        if (itemScaled === true) {
            dmg = 0;
            if (typeof this.addLog === 'function') this.addLog('🛡️ 피해 무효!', 'echo');
        } else if (typeof itemScaled === 'number' && Number.isFinite(itemScaled)) {
            dmg = Math.max(0, Math.floor(itemScaled));
        }

        if (dmg > 0) {
            const result = this.dispatch(Actions.PLAYER_DAMAGE, { amount: dmg, source: 'combat' });

            if (result && result.shieldAbsorbed > 0) {
                if (typeof this.addLog === 'function') this.addLog(`🛡️ 방어막 ${result.shieldAbsorbed} 흡수`, 'system');
            }
            if (result && result.actualDamage > 0) {
                if (typeof this.addLog === 'function') this.addLog(`💔 ${result.actualDamage} 피해 받음`, 'damage');
            }

            if (result && result.isDead && typeof this.onPlayerDeath === 'function') {
                this.onPlayerDeath(deps);
            }
        }
    },

    applyEnemyStatus(status, duration, targetIdx = null, deps = {}) {
        if (targetIdx === null) {
            const sel = this._selectedTarget;
            if (sel !== null && sel !== undefined && this.combat.enemies[sel]?.hp > 0) {
                targetIdx = sel;
            } else {
                targetIdx = this.combat.enemies.findIndex(e => e.hp > 0);
                if (targetIdx < 0) return;
            }
        }
        const enemy = this.combat.enemies[targetIdx];
        if (!enemy) return;

        const result = this.dispatch(Actions.ENEMY_STATUS, { status, duration, targetIdx });
        if (typeof this.addLog === 'function') this.addLog(`💫 ${enemy.name}: ${status} ${result?.duration || duration}턴`, 'echo');

        Logger.debug('[applyEnemyStatus] Applied', status, 'for', duration, 'turns to', enemy.name);
    },

    getEnemyIntent(targetIdx = null) {
        const idx = targetIdx !== null ? targetIdx : (this._selectedTarget !== null ? this._selectedTarget : 0);
        const enemy = this.combat.enemies[idx];
        if (!enemy || enemy.hp <= 0) return 0;
        return enemy.ai(this.combat.turn + 1)?.dmg || 0;
    },
};
