import { applyPlayerBuffState } from './player_state_commands.js';

function ensurePlayer(state) {
  return state?.player || null;
}

function ensureBuff(state, buffId) {
  const player = ensurePlayer(state);
  if (!player || !buffId) return null;
  if (!player.buffs || typeof player.buffs !== 'object') player.buffs = {};
  if (!player.buffs[buffId]) player.buffs[buffId] = { stacks: 0 };
  return player.buffs[buffId];
}

export function refreshResonanceState(state, damageBonus) {
  const player = ensurePlayer(state);
  if (!player) return null;
  const current = player.buffs?.resonance;
  if (!current) {
    if (typeof state.addBuff === 'function') {
      state.addBuff('resonance', 99, { dmgBonus: damageBonus });
    } else {
      applyPlayerBuffState(state, 'resonance', 99, { dmgBonus: damageBonus });
    }
    return player.buffs?.resonance || null;
  }

  const delta = Math.max(0, Number(damageBonus || 0));
  if (delta > 0) {
    const previousBonus = Number(current.dmgBonus || 0);
    if (typeof state.addBuff === 'function') {
      state.addBuff('resonance', 0, { dmgBonus: delta });
    } else {
      applyPlayerBuffState(state, 'resonance', 0, { dmgBonus: delta });
    }
    if (Number(current.dmgBonus || 0) === previousBonus) {
      current.dmgBonus = Math.min(30, previousBonus + delta);
    }
  }
  const resonance = ensureBuff(state, 'resonance');
  resonance.stacks = 99;
  return resonance;
}

export function resetMageCombatState(state) {
  const player = ensurePlayer(state);
  if (!player) return null;
  player._mageCastCounter = 0;
  player._traitCardDiscounts = {};
  player._mageLastDiscountTarget = null;
  return {
    counter: player._mageCastCounter,
    discounts: player._traitCardDiscounts,
    target: player._mageLastDiscountTarget,
  };
}

export function incrementMageCastCounterState(state) {
  const player = ensurePlayer(state);
  if (!player) return 0;
  player._mageCastCounter = Number(player._mageCastCounter || 0) + 1;
  return player._mageCastCounter;
}

export function resetMageCastCounterState(state) {
  const player = ensurePlayer(state);
  if (!player) return 0;
  player._mageCastCounter = 0;
  return player._mageCastCounter;
}

export function setMageDiscountTargetState(state, cardId) {
  const player = ensurePlayer(state);
  if (!player) return null;
  player._mageLastDiscountTarget = cardId ?? null;
  return player._mageLastDiscountTarget;
}

export function incrementMageTraitDiscountState(state, cardId) {
  const player = ensurePlayer(state);
  if (!player || !cardId) return 0;
  if (!player._traitCardDiscounts || typeof player._traitCardDiscounts !== 'object') {
    player._traitCardDiscounts = {};
  }
  player._traitCardDiscounts[cardId] = Number(player._traitCardDiscounts[cardId] || 0) + 1;
  return player._traitCardDiscounts[cardId];
}

export function resetHunterHitCountsState(state) {
  const player = ensurePlayer(state);
  if (!player) return null;
  player._hunterHitCounts = {};
  return player._hunterHitCounts;
}

export function consumeHunterPendingMarkState(state) {
  const player = ensurePlayer(state);
  if (!player) return 0;
  const pending = Number(player._classMasteryHunterMarkPending || 0);
  player._classMasteryHunterMarkPending = 0;
  return pending;
}

export function incrementHunterHitCountState(state, targetIdx) {
  const player = ensurePlayer(state);
  if (!player || targetIdx === null || targetIdx === undefined) return 0;
  if (!player._hunterHitCounts || typeof player._hunterHitCounts !== 'object') {
    player._hunterHitCounts = {};
  }
  player._hunterHitCounts[targetIdx] = Number(player._hunterHitCounts[targetIdx] || 0) + 1;
  return player._hunterHitCounts[targetIdx];
}

export function resetHunterHitCountState(state, targetIdx) {
  const player = ensurePlayer(state);
  if (!player || targetIdx === null || targetIdx === undefined) return 0;
  if (!player._hunterHitCounts || typeof player._hunterHitCounts !== 'object') {
    player._hunterHitCounts = {};
  }
  player._hunterHitCounts[targetIdx] = 0;
  return player._hunterHitCounts[targetIdx];
}

export function increaseBuffFieldState(_state, buffRef, field, amount) {
  if (!buffRef || !field) return 0;
  buffRef[field] = Number(buffRef[field] || 0) + (Number(amount) || 0);
  return buffRef[field];
}

export function setGuardianPreservedShieldState(state, amount) {
  const player = ensurePlayer(state);
  if (!player) return 0;
  player._preservedShield = Math.max(0, Number(amount) || 0);
  return player._preservedShield;
}
