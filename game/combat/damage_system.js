import { Actions } from '../shared/state/public.js';
import { Logger } from '../utils/logger.js';
import { LogUtils } from '../utils/log_utils.js';
import {
  adjustEnemyStatusDuration,
  advancePlayerChain,
  applyLifesteal,
  calculateBaseResolvedDamageValue,
  calculatePotentialDamageValue,
  createDamageRuntime,
  finalizeResolvedDamageValue,
  handleEnemyDamagePrevention,
  resolveEnemyDamageResult,
  resolveEnemyStatusTargetIndex,
  resolveIncomingPlayerDamage,
  resolveShieldGainAmount,
  resolveEnemyTargetIndex,
  runDealDamageClassHook,
} from './damage_system_helpers.js';

export const DamageSystem = {
  calculatePotentialDamage(amount, noChain = false) {
    const { getBuff } = createDamageRuntime(this);
    return calculatePotentialDamageValue(this, amount, noChain, getBuff);
  },

  dealDamage(amount, targetIdx = null, noChain = false, source = null, deps = {}) {
    const { win, enemies, getBuff, triggerItem } = createDamageRuntime(this, deps);
    const resolvedTargetIdx = resolveEnemyTargetIndex(this, enemies, targetIdx);
    if (resolvedTargetIdx < 0) return 0;

    const enemy = enemies[resolvedTargetIdx];
    if (!enemy || enemy.hp <= 0) return 0;

    const base = calculateBaseResolvedDamageValue(this, amount, getBuff);
    const prevented = handleEnemyDamagePrevention(this, enemy, resolvedTargetIdx);
    if (prevented === 'immune') {
      this.addLog?.(LogUtils.formatEcho(`${enemy.name} immune`), 'echo');
      return 0;
    }
    if (prevented === 'dodge') {
      this.addLog?.(LogUtils.formatSystem(`${enemy.name} dodge`), 'system');
      return 0;
    }

    const damage = finalizeResolvedDamageValue(this, base.damage, noChain, getBuff, triggerItem);
    const isCrit = (damage > Number(enemy.hp || 0) * 0.3) || (typeof this.getBuff === 'function' && this._lastCrit);
    const result = resolveEnemyDamageResult(this, enemy, resolvedTargetIdx, damage, isCrit);

    if (enemy.statusEffects?.thorns > 0) {
      const thornsAmt = enemy.statusEffects.thorns;
      this.addLog?.(LogUtils.formatAttack(enemy.name, '플레이어', thornsAmt), 'damage');
      this.takeDamage?.(thornsAmt, { name: enemy.name, type: 'enemy' }, deps);
    }

    advancePlayerChain(this, enemy, noChain, deps, win);

    const totalDamage = result?.totalDamage ?? damage;
    runDealDamageClassHook(this, totalDamage, resolvedTargetIdx, deps, win);

    if (typeof this.addLog === 'function') {
      if (source && source.name) {
        const icon = source.type === 'trait' ? '[특성]' : (source.type === 'item' ? '[아이템]' : '[효과]');
        this.addLog(`${icon} [${source.name}] -> ${enemy.name}: ${totalDamage} dmg`, 'damage');
      } else if (this._currentCard) {
        const cardWasCrit = base.hasCritBuff || result?.isCrit;
        if (cardWasCrit) {
          this.addLog(LogUtils.formatCardCritical(this._currentCard.name, enemy.name, totalDamage), 'card-log');
        } else {
          this.addLog(LogUtils.formatCardAttack(this._currentCard.name, enemy.name, totalDamage), 'card-log');
        }
      } else {
        this.addLog(LogUtils.formatAttack('플레이어', enemy.name, totalDamage), 'damage');
      }
    }

    applyLifesteal(this, totalDamage, getBuff);
    this.markDirty?.('enemies');

    if (typeof deps.updateStatusDisplay === 'function') {
      deps.updateStatusDisplay();
    }

    if (result?.isDead && typeof this.onEnemyDeath === 'function') {
      this.onEnemyDeath(enemy, resolvedTargetIdx, deps);
    }

    return result?.actualDamage ?? damage;
  },

  dealDamageAll(amount, noChain = false, deps = {}) {
    const alive = this.combat.enemies.map((_, i) => i).filter((i) => this.combat.enemies[i].hp > 0);
    alive.forEach((i, idx) => {
      this.dealDamage(amount, i, noChain || (idx < alive.length - 1), null, deps);
    });
  },

  addShield(amount, source = null, deps = {}) {
    const actual = resolveShieldGainAmount(this, amount);
    if (actual < amount && typeof this.addLog === 'function' && (
      this.runConfig?.curse === 'fatigue' || this.meta?.runConfig?.curse === 'fatigue'
    )) {
      this.addLog('꿈의 피로로 방어막 획득 감소 (-10)', 'system');
    }

    this.dispatch(Actions.PLAYER_SHIELD, { amount: actual });
    if (typeof this.addLog === 'function') {
      if (source && source.name) {
        const icon = source.type === 'item' ? '🛡' : '✨';
        this.addLog(`${icon} ${source.name}: 방어막 +${actual}`, 'shield');
      } else if (this._currentCard) {
        this.addLog(LogUtils.formatCardShield(this._currentCard.name, actual), 'buff');
      } else {
        this.addLog(LogUtils.formatShield('플레이어', actual), 'shield');
      }
    }
  },

  takeDamage(amount, source = null, deps = {}) {
    const { getBuff, triggerItem } = createDamageRuntime(this, deps);
    const incoming = resolveIncomingPlayerDamage(this, amount, getBuff, triggerItem);

    if (incoming.damage <= 0) {
      if (incoming.immuneBlocked) {
        this.addLog?.(LogUtils.formatEcho('신성 방패 면역으로 피해 무효!'), 'echo');
      } else if (incoming.itemBlocked) {
        this.addLog?.(LogUtils.formatEcho('아이템 피해 무효!'), 'echo');
      }
      return;
    }

    if (incoming.vulnerableTriggered) {
      this.addLog?.(LogUtils.formatEcho('취약: 피해량 증가!'), 'damage');
    }

    const shieldBefore = Number(this.player?.shield || 0);
    const result = this.dispatch(Actions.PLAYER_DAMAGE, { amount: incoming.damage, source: 'combat' });

    if (result?.shieldAbsorbed > 0) {
      this.addLog?.(LogUtils.formatShield('플레이어', result.shieldAbsorbed), 'shield');
      const shieldAfter = Number(this.player?.shield || 0);
      const brokeShield = shieldBefore > 0 && shieldAfter <= 0 && result.shieldAbsorbed >= shieldBefore;
      if (brokeShield && typeof this.triggerItems === 'function') {
        this.triggerItems('shield_break', shieldBefore);
      }
    }

    if (result?.actualDamage > 0) {
      if (typeof this.addLog === 'function') {
        if (source && source.name) {
          const icon = source.type === 'item' ? '🗡' : '💥';
          this.addLog(`${icon} ${source.name} -> 플레이어: ${result.actualDamage} 피해`, 'damage');
        } else {
          this.addLog(LogUtils.formatAttack('적', '플레이어', result.actualDamage), 'damage');
        }
      }

      const echoOnHit = this.getBuff?.('echo_on_hit');
      if (echoOnHit && typeof this.addEcho === 'function') {
        this.addEcho(echoOnHit.echoAmount || 5);
        this.addLog?.(LogUtils.formatEcho(`반향: 메아리 충전 (+${echoOnHit.echoAmount || 5})`), 'echo');
      }
    }

    if (result?.isDead && typeof this.onPlayerDeath === 'function') {
      this.onPlayerDeath(deps);
    }
  },

  applyEnemyStatus(status, duration, targetIdx = null, deps = {}) {
    const resolvedTargetIdx = resolveEnemyStatusTargetIndex(this, targetIdx);
    if (resolvedTargetIdx < 0) return;

    const enemy = this.combat.enemies[resolvedTargetIdx];
    if (!enemy) return;

    if (this._lastDodgedTarget === resolvedTargetIdx) {
      this._lastDodgedTarget = null;
      this.addLog?.(LogUtils.formatSystem(`회피 ${enemy.name}: 강회로 ${status} 무효화`), 'system');
      return;
    }

    const adjustedDuration = adjustEnemyStatusDuration(this, status, duration, resolvedTargetIdx);
    const result = this.dispatch(Actions.ENEMY_STATUS, {
      status,
      duration: adjustedDuration,
      targetIdx: resolvedTargetIdx,
    });

    this.addLog?.(LogUtils.formatStatus(enemy.name, status, result?.duration || adjustedDuration), 'echo');
    Logger.debug('[applyEnemyStatus] Applied', status, 'for', adjustedDuration, 'turns to', enemy.name);
  },

  getEnemyIntent(targetIdx = null) {
    const idx = targetIdx !== null ? targetIdx : (this._selectedTarget !== null ? this._selectedTarget : 0);
    const enemy = this.combat.enemies[idx];
    if (!enemy || enemy.hp <= 0) return 0;
    return enemy.ai(this.combat.turn + 1)?.dmg || 0;
  },
};
