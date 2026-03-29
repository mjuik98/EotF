import { Actions } from '../ports/public_state_action_capabilities.js';
import {
  createRecentFeedMeta,
  Logger,
  LogUtils,
} from '../ports/combat_logging.js';
import {
  applyResolvedEnemyDamageEffects,
} from './damage_system_effects.js';
import {
  logEnemyStatusResult,
  logShieldGainResult,
} from './damage_system_logging.js';
import {
  applyEnemyStatusState,
  applyPlayerDamageState,
  applyPlayerShieldState,
} from '../state/card_state_commands.js';
import {
  adjustEnemyStatusDuration,
  calculateBaseResolvedDamageValue,
  calculatePotentialDamageValue,
  createDamageRuntime,
  finalizeResolvedDamageValue,
  getAliveEnemyIndexes,
  getSelectedTargetIndex,
  handleEnemyDamagePrevention,
  isFatigueCurseActive,
  resolveEnemyDamageResult,
  resolveEnemyStatusTargetIndex,
  resolveIncomingPlayerDamage,
  resolveShieldGainAmount,
  resolveEnemyTargetIndex,
} from './damage_system_runtime_helpers.js';
import { getResolvedEnemyAction } from '../domain/enemy_intent_domain.js';

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

    const damage = finalizeResolvedDamageValue(this, base.damage, noChain, getBuff, triggerItem, resolvedTargetIdx);
    const isCrit = (damage > Number(enemy.hp || 0) * 0.3) || (typeof this.getBuff === 'function' && this._lastCrit);
    const result = resolveEnemyDamageResult(this, enemy, resolvedTargetIdx, damage, isCrit);

    if (enemy.statusEffects?.thorns > 0) {
      const thornsAmt = enemy.statusEffects.thorns;
      this.addLog?.(LogUtils.formatAttack(enemy.name, '플레이어', thornsAmt), 'damage');
      this.takeDamage?.(thornsAmt, { name: enemy.name, type: 'enemy' }, deps);
    }

    return applyResolvedEnemyDamageEffects(this, {
      enemy,
      resolvedTargetIdx,
      result,
      damage,
      noChain,
      deps,
      win,
      getBuff,
      source,
      base,
    });
  },

  dealDamageAll(amount, noChain = false, deps = {}) {
    const alive = getAliveEnemyIndexes(this);
    alive.forEach((i, idx) => {
      DamageSystem.dealDamage.call(this, amount, i, noChain || (idx < alive.length - 1), null, deps);
    });
  },

  addShield(amount, source = null, deps = {}) {
    const actual = resolveShieldGainAmount(this, amount);
    if (actual < amount && typeof this.addLog === 'function' && isFatigueCurseActive(this)) {
      this.addLog('꿈의 피로로 방어막 획득 감소 (-10)', 'system');
    }

    applyPlayerShieldState(this, actual);
    logShieldGainResult(this, { actual, source });
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
    const result = applyPlayerDamageState(this, { amount: incoming.damage, source: 'combat' });

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
    const result = applyEnemyStatusState(this, {
      status,
      duration: adjustedDuration,
      targetIdx: resolvedTargetIdx,
    });

    logEnemyStatusResult(this, {
      enemyName: enemy.name,
      status,
      duration: result?.duration || adjustedDuration,
    });
    Logger.debug('[applyEnemyStatus] Applied', status, 'for', adjustedDuration, 'turns to', enemy.name);
  },

  getEnemyIntent(targetIdx = null) {
    const idx = getSelectedTargetIndex(this, targetIdx);
    const enemy = this.combat.enemies[idx];
    if (!enemy || enemy.hp <= 0) return 0;
    return getResolvedEnemyAction(this, enemy, this.combat.turn + 1)?.dmg || 0;
  },
};
