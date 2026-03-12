export function setCurrentCombatAttackerState(state, attackerIndex) {
  if (!state?.combat) return null;
  state.combat._currentAttackerIdx = attackerIndex;
  return state.combat._currentAttackerIdx;
}

export function applyEnemyDamageState(state, enemy, nextHp) {
  const hpBefore = Number(enemy?.hp || 0);
  enemy.hp = Math.max(0, nextHp);
  const dealt = Math.max(0, hpBefore - enemy.hp);
  if (dealt > 0 && state?.stats) {
    state.stats.damageDealt = (state.stats.damageDealt || 0) + dealt;
  }
  return dealt;
}

export function replacePlayerBuffsState(state, nextBuffs = {}) {
  if (!state?.player) return nextBuffs;
  state.player.buffs = nextBuffs;
  return state.player.buffs;
}

export function applyEnemyHealState(enemy, heal) {
  if (!enemy) return Number(enemy?.hp || 0);
  const maxHp = Math.max(Number(enemy.maxHp || enemy.hp || 0), Number(enemy.hp || 0));
  enemy.hp = Math.min(maxHp, Math.max(0, Number(enemy.hp || 0) + Math.max(0, Math.floor(Number(heal) || 0))));
  return enemy.hp;
}

export function applyEnemyStatusUpdatesState(enemy, statusUpdates = []) {
  if (!enemy || !Array.isArray(statusUpdates) || statusUpdates.length === 0) {
    return enemy?.statusEffects;
  }

  if (!enemy.statusEffects) enemy.statusEffects = {};
  statusUpdates.forEach(({ statusKey, nextValue }) => {
    if (!statusKey) return;
    if (nextValue === undefined) {
      delete enemy.statusEffects[statusKey];
      return;
    }
    enemy.statusEffects[statusKey] = nextValue;
  });

  return enemy.statusEffects;
}

export function decrementEnemyStatusCounterState(enemy, statusKey) {
  if (!enemy || !statusKey || !enemy.statusEffects?.[statusKey]) return undefined;

  const nextValue = Number(enemy.statusEffects[statusKey]) - 1;
  if (nextValue > 0) {
    enemy.statusEffects[statusKey] = nextValue;
    return nextValue;
  }

  delete enemy.statusEffects[statusKey];
  return undefined;
}

export function consumeEnemyStunState(enemy) {
  if (!enemy?.statusEffects?.stunned || enemy.statusEffects.stunned <= 0) {
    return { stunnedConsumed: false, weakenedDecayed: false };
  }

  decrementEnemyStatusCounterState(enemy, 'stunned');

  const weakenedDecayed = Boolean(enemy.statusEffects?.weakened > 0);
  if (weakenedDecayed) {
    decrementEnemyStatusCounterState(enemy, 'weakened');
  }

  return { stunnedConsumed: true, weakenedDecayed };
}

export function decayEnemyWeakenState(enemy) {
  if (!enemy?.statusEffects?.weakened || enemy.statusEffects.weakened <= 0) {
    return false;
  }

  decrementEnemyStatusCounterState(enemy, 'weakened');
  return true;
}
