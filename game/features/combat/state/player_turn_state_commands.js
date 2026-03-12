import {
  advanceCombatTurn,
  clampPlayerMaxEcho,
  decrementStackedBuff,
  drawFromRandomPlayerPool,
  moveHandToGraveyard,
  pushCardToExhausted,
  reducePlayerEnergy,
  reducePlayerSilenceGauge,
  resetPlayerTimeRiftGauge,
  resetTurnCardCostState,
  setCombatPlayerTurn,
  setPlayerEchoChain,
  setPlayerEnergy,
  setPlayerShield,
} from '../../../domain/combat/turn/turn_state_mutators.js';

export function consumePlayerBuffStackState(state, buffId) {
  if (!state?.player?.buffs || !buffId) return false;
  return decrementStackedBuff(state.player.buffs, buffId);
}

export function reducePlayerTurnEnergyState(state, amount) {
  if (!state?.player) return 0;
  return reducePlayerEnergy(state, amount);
}

export function beginPlayerTurnState(state, { isStunned = false } = {}) {
  if (!state?.combat || !state?.player) return null;

  advanceCombatTurn(state);
  setCombatPlayerTurn(state, true);
  setPlayerEnergy(state, isStunned ? 0 : state.player.maxEnergy);
  setPlayerShield(state, 0);

  return {
    energy: state.player.energy,
    playerTurn: state.combat.playerTurn,
    turn: state.combat.turn,
  };
}

export function exhaustRandomPlayerCardState(state, pools, pickIndex) {
  const { cardId, poolKey } = drawFromRandomPlayerPool(state, pools, pickIndex);
  if (!cardId) return { cardId: null, poolKey: null };

  pushCardToExhausted(state, cardId);
  if (poolKey === 'hand') state.markDirty?.('hand');

  return { cardId, poolKey };
}

export function reducePlayerTurnSilenceGaugeState(state, amount) {
  return reducePlayerSilenceGauge(state, amount);
}

export function resetPlayerTurnTimeRiftState(state) {
  return resetPlayerTimeRiftGauge(state);
}

export function reducePlayerTurnMaxEchoState(state, amount) {
  const nextMax = (state?.player?.maxEcho || 100) - Math.max(0, amount);
  return clampPlayerMaxEcho(state, nextMax);
}

export function advancePlayerPoisonDurationState(state) {
  const poisoned = state?.player?.buffs?.poisoned;
  if (!poisoned) return undefined;

  poisoned.poisonDuration = (poisoned.poisonDuration || 1) - 1;
  if (poisoned.poisonDuration <= 0) {
    delete state.player.buffs.poisoned;
    return undefined;
  }

  return poisoned.poisonDuration;
}

export function finalizePlayerTurnEndState(state) {
  if (!state?.combat || !state?.player) return null;

  moveHandToGraveyard(state);
  setPlayerEchoChain(state, 0);
  resetTurnCardCostState(state);
  setCombatPlayerTurn(state, false);

  return {
    echoChain: state.player.echoChain,
    handSize: state.player.hand.length,
    graveyardSize: state.player.graveyard.length,
    playerTurn: state.combat.playerTurn,
  };
}
