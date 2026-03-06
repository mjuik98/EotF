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

import { LogUtils } from '../utils/log_utils.js';

const _getDoc = (deps) => deps?.doc || document;
const _getWin = (deps) => deps?.win || window;

export const DamageSystem = {
    /**
     * 예상 데미지를 계산합니다 (툴팁용, 부작용 없음).
     */
    calculatePotentialDamage(amount, noChain = false) {
        let dmg = amount;
        const res = this.getBuff?.('resonance');
        if (res) dmg += res.dmgBonus || 0;
        const accel = this.getBuff?.('acceleration');
        if (accel) dmg += accel.dmgBonus || 0;
        const sha = this.getBuff?.('shadow_atk');
        if (sha) dmg += sha.dmgBonus || 0;
        const berserk = this.getBuff?.('berserk_mode');
        if (berserk) dmg += berserk.atkGrowth || 0;
        const berserkPlus = this.getBuff?.('berserk_mode_plus');
        if (berserkPlus) dmg += berserkPlus.atkGrowth || 0;
        const echoBerserk = this.getBuff?.('echo_berserk');
        if (echoBerserk) dmg += echoBerserk.atkGrowth || 0;
        const masteryFlat = Number(this.player?._classMasteryFlatDamageBonus || 0);
        if (Number.isFinite(masteryFlat) && masteryFlat > 0) dmg += Math.floor(masteryFlat);

        if (this.getBuff?.('vanish') || this.getBuff?.('focus') || this.getBuff?.('critical_turn')) {
            dmg = Math.floor(dmg * 2);
        }

        if ((this.getBuff?.('weakened')?.stacks || 0) > 0) {
            dmg = Math.max(0, Math.floor(dmg * 0.5));
        }

        let chainBonus = 0;
        if (!noChain && this.player.echoChain > 2) {
            chainBonus = Math.floor(dmg * 0.2);
            if (this.player.chainBonusMult) {
                chainBonus = Math.floor(chainBonus * this.player.chainBonusMult);
            }
        }
        dmg += chainBonus;

        return Math.floor(dmg);
    },

    dealDamage(amount, targetIdx = null, noChain = false, source = null, deps = {}) {
        const win = _getWin(deps);
        const enemies = Array.isArray(this.combat?.enemies) ? this.combat.enemies : [];
        const getBuff = (id) => {
            if (typeof this.getBuff === 'function') return this.getBuff(id);
            return this.player?.buffs?.[id] || null;
        };
        const triggerItem = (trigger, payload) => (
            typeof this.triggerItems === 'function' ? this.triggerItems(trigger, payload) : undefined
        );

        Logger.debug('[dealDamage] Called with targetIdx:', targetIdx, '_selectedTarget:', this._selectedTarget);
        Logger.debug('[dealDamage] Enemies:', enemies.map(function (enemy) {
            return { name: enemy.name, hp: enemy.hp };
        }));
        if (enemies.length === 0) return 0;

        if (targetIdx === null) {
            const sel = this._selectedTarget;
            if (sel !== null && sel !== undefined && enemies[sel]?.hp > 0) {
                targetIdx = sel;
                Logger.debug('[dealDamage] Using _selectedTarget:', targetIdx);
            } else {
                targetIdx = enemies.findIndex(e => e.hp > 0);
                Logger.debug('[dealDamage] Using first alive enemy:', targetIdx);
                if (targetIdx < 0) return 0;
            }
        }
        const enemy = enemies[targetIdx];
        if (!enemy || enemy.hp <= 0) return 0;

        let dmg = amount;
        const res = getBuff('resonance');
        if (res) dmg += res.dmgBonus || 0;
        const accel = getBuff('acceleration');
        if (accel) dmg += accel.dmgBonus || 0;
        const sha = getBuff('shadow_atk');
        if (sha) {
            dmg += sha.dmgBonus || 0;
            if (this.player?.buffs) delete this.player.buffs['shadow_atk'];
        }
        const berserk = getBuff('berserk_mode');
        if (berserk) dmg += berserk.atkGrowth || 0;
        const berserkPlus = getBuff('berserk_mode_plus');
        if (berserkPlus) dmg += berserkPlus.atkGrowth || 0;
        const echoBerserk = getBuff('echo_berserk');
        if (echoBerserk) dmg += echoBerserk.atkGrowth || 0;
        const masteryFlat = Number(this.player?._classMasteryFlatDamageBonus || 0);
        if (Number.isFinite(masteryFlat) && masteryFlat > 0) dmg += Math.floor(masteryFlat);
        if (getBuff('vanish') || getBuff('focus') || getBuff('critical_turn')) {
            dmg = Math.floor(dmg * 2);
            // 치명타 버프 소모: critical_turn 은 소모되지 않음
            if (!getBuff('critical_turn') && this.player?.buffs) {
                if (getBuff('vanish')) delete this.player.buffs['vanish'];
                if (getBuff('focus')) delete this.player.buffs['focus'];
            }
        }
        if (enemy.statusEffects?.immune > 0) {
            this.addLog(LogUtils.formatEcho(`${enemy.name} immune`), 'echo');
            return 0;
        }
        if (enemy.statusEffects?.dodge > 0) {
            this.addLog(LogUtils.formatSystem(`${enemy.name} dodge`), 'system');

            // Keep track so immediate follow-up status effects are skipped as well.
            this._lastDodgedTarget = targetIdx;

            enemy.statusEffects.dodge--;
            if (enemy.statusEffects.dodge <= 0) delete enemy.statusEffects.dodge;
            return 0;
        }
        if ((getBuff('weakened')?.stacks || 0) > 0) {
            dmg = Math.max(0, Math.floor(dmg * 0.5));
        }

        const itemScaled = triggerItem('deal_damage', dmg);
        if (typeof itemScaled === 'number' && Number.isFinite(itemScaled)) {
            dmg = Math.max(0, Math.floor(itemScaled));
        }
        let chainBonus = 0;
        if (!noChain && this.player.echoChain > 2) {
            chainBonus = Math.floor(dmg * 0.2);
            if (this.player.chainBonusMult) {
                chainBonus = Math.floor(chainBonus * this.player.chainBonusMult);
            }
        }
        dmg += chainBonus;

        if (this.player.echoChain > 0) {
            const chainScaled = triggerItem('chain_dmg', dmg);
            if (typeof chainScaled === 'number' && Number.isFinite(chainScaled)) {
                dmg = Math.max(0, Math.floor(chainScaled));
            }
        }

        const prevHp = Number(enemy.hp || 0);
        const prevShield = Number(enemy.shield || 0);
        const prevDamageDealt = Number(this.stats?.damageDealt || 0);
        const isCrit = (dmg > prevHp * 0.3) || (typeof this.getBuff === 'function' && this._lastCrit);

        const buildObservedResult = () => {
            const hpAfter = Number(enemy.hp || 0);
            const shieldAfter = Number(enemy.shield || 0);
            const shieldAbsorbed = Math.max(0, prevShield - shieldAfter);
            const actualDamage = Math.max(0, prevHp - hpAfter);
            return {
                shieldAbsorbed,
                actualDamage,
                totalDamage: shieldAbsorbed + actualDamage,
                hpAfter,
                isDead: hpAfter <= 0,
                targetIdx,
            };
        };

        const applyFallbackDamage = () => {
            let remaining = Math.max(0, Math.floor(dmg));
            if (prevShield > 0) {
                const absorbed = Math.min(prevShield, remaining);
                enemy.shield = Math.max(0, prevShield - absorbed);
                remaining -= absorbed;
            }
            enemy.hp = Math.max(0, prevHp - remaining);
            const actualDamage = Math.max(0, prevHp - enemy.hp);
            if (this.stats) {
                this.stats.damageDealt = Math.max(0, Number(this.stats.damageDealt || 0)) + actualDamage;
            }
            return {
                shieldAbsorbed: Math.max(0, prevShield - Number(enemy.shield || 0)),
                actualDamage,
                totalDamage: Math.max(0, Math.floor(dmg)),
                hpAfter: enemy.hp,
                isDead: enemy.hp <= 0,
                targetIdx,
            };
        };

        let result = null;
        if (typeof this.dispatch === 'function') {
            try {
                result = this.dispatch(Actions.ENEMY_DAMAGE, { amount: dmg, targetIdx, isCrit });
            } catch (dispatchErr) {
                Logger.warn('[dealDamage] ENEMY_DAMAGE dispatch failed; applying fallback mutation.', dispatchErr);
            }
        }
        const hasDispatchMutation = (
            Number(enemy.hp || 0) !== prevHp
            || Number(enemy.shield || 0) !== prevShield
            || Number(this.stats?.damageDealt || 0) !== prevDamageDealt
        );
        if (!result || typeof result !== 'object' || !Number.isFinite(result.actualDamage)) {
            result = hasDispatchMutation ? buildObservedResult() : applyFallbackDamage();
        }

        // Thorn retaliation
        if (enemy.statusEffects?.thorns > 0) {
            const thornsAmt = enemy.statusEffects.thorns;
            if (typeof this.addLog === 'function') this.addLog(LogUtils.formatAttack(enemy.name, '플레이어', thornsAmt), 'damage');
            this.takeDamage?.(thornsAmt, { name: enemy.name, type: 'enemy' }, deps);
        }

        if (!noChain) {
            const prevChain = this.player.echoChain || 0;
            this.player.echoChain = prevChain + 1;
            this.triggerItems?.('chain_gain', { chain: this.player.echoChain });
            if (prevChain < 5 && this.player.echoChain >= 5) this.triggerItems?.('chain_reach_5', { chain: this.player.echoChain });
            this.addEcho(10);
            const updateChainDisplay = deps.updateChainDisplay
                || this.updateChainDisplay
                || win.updateChainDisplay
                || win.CombatLifecycle?.updateChainDisplay;
            if (typeof updateChainDisplay === 'function') {
                updateChainDisplay.call(win.CombatLifecycle || this, deps);
            } else {
                const updateChainUI = deps.updateChainUI || win.updateChainUI;
                if (typeof updateChainUI === 'function') updateChainUI(this.player.echoChain);
            }
        } else if (enemy.hp <= 0 && this._echoAddedThisAction === false) {
            this.addEcho(10);
        }

        const totalDmg = result?.totalDamage ?? dmg;

        const classMechanics = deps.classMechanics || win.ClassMechanics || win.GAME?.Modules?.['ClassMechanics'];
        const classMech = classMechanics?.[this.player.class];
        if (classMech && typeof classMech.onDealDamage === 'function') {
            classMech.onDealDamage(this, totalDmg, targetIdx);
        }

        if (typeof this.addLog === 'function') {
            if (source && source.name) {
                const icon = source.type === 'trait' ? '[특성]' : (source.type === 'item' ? '[유물]' : '[타격]');
                this.addLog(`${icon} [${source.name}] -> ${enemy.name}: ${totalDmg} dmg`, 'damage');
            } else {
                const _card = this._currentCard;
                if (_card) {
                    const isCrit = !!(getBuff('vanish') || getBuff('focus') || getBuff('critical_turn')) || result?.isCrit;
                    if (isCrit) {
                        this.addLog(LogUtils.formatCardCritical(_card.name, enemy.name, totalDmg), 'card-log');
                    } else {
                        this.addLog(LogUtils.formatCardAttack(_card.name, enemy.name, totalDmg), 'card-log');
                    }
                } else {
                    this.addLog(LogUtils.formatAttack('플레이어', enemy.name, totalDmg), 'damage');
                }
            }
        }

        const ls = getBuff('lifesteal');
        if (ls && ls.percent && totalDmg > 0) {
            const healAmt = Math.floor(totalDmg * (ls.percent / 100));
            if (healAmt > 0) {
                this.heal(healAmt, { name: 'lifesteal', type: 'buff' });
            }
        }
        this.markDirty?.('enemies');

        if (typeof deps?.updateStatusDisplay === 'function') {
            deps.updateStatusDisplay();
        }

        if (result && result.isDead && typeof this.onEnemyDeath === 'function') {
            this.onEnemyDeath(enemy, targetIdx, deps);
        }

        return result?.actualDamage ?? dmg;
    },
    dealDamageAll(amount, noChain = false, deps = {}) {
        const alive = this.combat.enemies.map((_, i) => i).filter(i => this.combat.enemies[i].hp > 0);
        alive.forEach((i, idx) => {
            this.dealDamage(amount, i, noChain || (idx < alive.length - 1), null, deps);
        });
    },

    addShield(amount, source = null, deps = {}) {
        let actual = amount;
        if (this.runConfig?.curse === 'fatigue' || this.meta?.runConfig?.curse === 'fatigue') {
            actual = Math.max(0, amount - 10);
            if (actual < amount && typeof this.addLog === 'function') this.addLog('📉 피로의 저주: 방어막 획득 감소 (-10)', 'system');
        }
        if (typeof this.triggerItems === 'function') {
            const scaled = this.triggerItems('shield_gain', actual);
            if (typeof scaled === 'number' && Number.isFinite(scaled)) {
                actual = Math.max(0, Math.floor(scaled));
            }
        }

        this.dispatch(Actions.PLAYER_SHIELD, { amount: actual });
        if (typeof this.addLog === 'function') {
            if (source && source.name) {
                const icon = source.type === 'item' ? '💍' : '🛡️';
                this.addLog(`${icon} ${source.name}: 방어막 +${actual}`, 'shield');
            } else {
                const _card = this._currentCard;
                if (_card) {
                    this.addLog(LogUtils.formatCardShield(_card.name, actual), 'buff');
                } else {
                    this.addLog(LogUtils.formatShield('플레이어', actual), 'shield');
                }
            }
        }
    },

    takeDamage(amount, source = null, deps = {}) {
        if (amount <= 0) return;

        if (typeof this.getBuff === 'function' && this.getBuff('immune')) {
            if (typeof this.addLog === 'function') this.addLog(LogUtils.formatEcho('🏛️ 면역으로 피해 무효!'), 'echo');
            return;
        }

        let dmg = amount;
        if ((this.getBuff?.('vulnerable')?.stacks || 0) > 0) {
            dmg = Math.floor(dmg * 1.5);
            if (typeof this.addLog === 'function') this.addLog(LogUtils.formatEcho('💢 취약: 피해량 증가!'), 'damage');
        }

        if ('dmgTakenMult' in this.player) {
            dmg = Math.floor(dmg * this.player.dmgTakenMult);
        }

        const itemScaled = typeof this.triggerItems === 'function' ? this.triggerItems('damage_taken', dmg) : dmg;
        if (itemScaled === true) {
            dmg = 0;
            if (typeof this.addLog === 'function') this.addLog(LogUtils.formatEcho('🛡️ 피해 무효!'), 'echo');
        } else if (typeof itemScaled === 'number' && Number.isFinite(itemScaled)) {
            dmg = Math.max(0, Math.floor(itemScaled));
        }

        if (dmg > 0) {
            const shieldBefore = Number(this.player?.shield || 0);
            const result = this.dispatch(Actions.PLAYER_DAMAGE, { amount: dmg, source: 'combat' });

            if (result && result.shieldAbsorbed > 0) {
                if (typeof this.addLog === 'function') this.addLog(LogUtils.formatShield('플레이어', result.shieldAbsorbed), 'shield');
                const shieldAfter = Number(this.player?.shield || 0);
                const brokeShield = shieldBefore > 0 && shieldAfter <= 0 && result.shieldAbsorbed >= shieldBefore;
                if (brokeShield && typeof this.triggerItems === 'function') {
                    this.triggerItems('shield_break', shieldBefore);
                }
            }
            if (result && result.actualDamage > 0) {
                if (typeof this.addLog === 'function') {
                    if (source && source.name) {
                        const icon = source.type === 'item' ? '💍' : '💥';
                        this.addLog(`${icon} ${source.name} → 플레이어: ${result.actualDamage} 피해`, 'damage');
                    } else {
                        this.addLog(LogUtils.formatAttack('적', '플레이어', result.actualDamage), 'damage');
                    }
                }

                // 잔향 반향(echo_on_hit) 버프 처리
                const eoh = this.getBuff('echo_on_hit');
                if (eoh && typeof this.addEcho === 'function') {
                    this.addEcho(eoh.echoAmount || 5);
                    this.addLog(LogUtils.formatEcho(`반향: 잔향 충전 (+${eoh.echoAmount || 5})`), 'echo');
                }
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

        // 회피된 타겟이면 상태이상도 무효화 (회피 후 1회 한정)
        if (this._lastDodgedTarget === targetIdx) {
            this._lastDodgedTarget = null;
            if (typeof this.addLog === 'function') this.addLog(LogUtils.formatSystem(`💨 ${enemy.name}: 강회피로 ${status} 무효화!`), 'system');
            return;
        }

        if (typeof this.triggerItems === 'function') {
            const adjusted = this.triggerItems('enemy_status_apply', { status, duration, targetIdx });
            if (typeof adjusted === 'number' && Number.isFinite(adjusted)) {
                duration = Math.max(0, Math.floor(adjusted));
            }
        }

        const result = this.dispatch(Actions.ENEMY_STATUS, { status, duration, targetIdx });
        if (typeof this.addLog === 'function') this.addLog(LogUtils.formatStatus(enemy.name, status, result?.duration || duration), 'echo');

        Logger.debug('[applyEnemyStatus] Applied', status, 'for', duration, 'turns to', enemy.name);
    },

    getEnemyIntent(targetIdx = null) {
        const idx = targetIdx !== null ? targetIdx : (this._selectedTarget !== null ? this._selectedTarget : 0);
        const enemy = this.combat.enemies[idx];
        if (!enemy || enemy.hp <= 0) return 0;
        return enemy.ai(this.combat.turn + 1)?.dmg || 0;
    },
};
