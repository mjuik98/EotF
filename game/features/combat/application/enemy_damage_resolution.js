import { Logger } from '../ports/combat_logging.js';
import { applyEnemyDamageState } from '../state/card_state_commands.js';

export function resolveEnemyTargetIndex(gs, enemies, targetIdx) {
  Logger.debug('[dealDamage] Called with targetIdx:', targetIdx, '_selectedTarget:', gs._selectedTarget);
  Logger.debug('[dealDamage] Enemies:', enemies.map((enemy) => ({ name: enemy.name, hp: enemy.hp })));

  if (enemies.length === 0) return -1;

  if (targetIdx !== null && targetIdx !== undefined) {
    return enemies[targetIdx]?.hp > 0 ? targetIdx : -1;
  }

  const selected = gs._selectedTarget;
  if (selected !== null && selected !== undefined && enemies[selected]?.hp > 0) {
    Logger.debug('[dealDamage] Using _selectedTarget:', selected);
    return selected;
  }

  const firstAlive = enemies.findIndex((enemy) => enemy.hp > 0);
  Logger.debug('[dealDamage] Using first alive enemy:', firstAlive);
  return firstAlive;
}

export function handleEnemyDamagePrevention(gs, enemy, targetIdx) {
  if (enemy.statusEffects?.immune > 0) return 'immune';

  if (enemy.statusEffects?.dodge > 0) {
    gs._lastDodgedTarget = targetIdx;
    enemy.statusEffects.dodge -= 1;
    if (enemy.statusEffects.dodge <= 0) delete enemy.statusEffects.dodge;
    return 'dodge';
  }

  return null;
}

export function resolveEnemyDamageResult(gs, enemy, targetIdx, damage, isCrit) {
  const prevHp = Number(enemy.hp || 0);
  const prevShield = Number(enemy.shield || 0);
  const prevDamageDealt = Number(gs.stats?.damageDealt || 0);

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
    let remaining = Math.max(0, Math.floor(damage));
    if (prevShield > 0) {
      const absorbed = Math.min(prevShield, remaining);
      enemy.shield = Math.max(0, prevShield - absorbed);
      remaining -= absorbed;
    }

    enemy.hp = Math.max(0, prevHp - remaining);
    const actualDamage = Math.max(0, prevHp - enemy.hp);
    if (gs.stats) {
      gs.stats.damageDealt = Math.max(0, Number(gs.stats.damageDealt || 0)) + actualDamage;
    }

    return {
      shieldAbsorbed: Math.max(0, prevShield - Number(enemy.shield || 0)),
      actualDamage,
      totalDamage: Math.max(0, Math.floor(damage)),
      hpAfter: enemy.hp,
      isDead: enemy.hp <= 0,
      targetIdx,
    };
  };

  let result = null;
  if (typeof gs.dispatch === 'function') {
    try {
      result = applyEnemyDamageState(gs, { amount: damage, targetIdx, isCrit });
    } catch (dispatchErr) {
      Logger.warn('[dealDamage] ENEMY_DAMAGE dispatch failed; applying fallback mutation.', dispatchErr);
    }
  }

  const hasDispatchMutation = (
    Number(enemy.hp || 0) !== prevHp
    || Number(enemy.shield || 0) !== prevShield
    || Number(gs.stats?.damageDealt || 0) !== prevDamageDealt
  );

  if (!result || typeof result !== 'object' || !Number.isFinite(result.actualDamage)) {
    result = hasDispatchMutation ? buildObservedResult() : applyFallbackDamage();
  }

  return result;
}
