import { Actions } from '../../../shared/state/public.js';

export function drawCardsState(gs, count = 1) {
  if (!gs?.dispatch) return null;
  return gs.dispatch(Actions.CARD_DRAW, { count });
}

export function discardCardState(gs, cardId, isExhaust = false, skipHandRemove = false) {
  if (!gs?.dispatch) return null;
  return gs.dispatch(Actions.CARD_DISCARD, {
    cardId,
    exhaust: isExhaust,
    skipHandRemove,
  });
}

export function changePlayerEnergyState(gs, amount) {
  if (!gs?.dispatch) return null;
  return gs.dispatch(Actions.PLAYER_ENERGY, { amount });
}

export function applyEnemyDamageState(gs, payload = {}) {
  if (!gs?.dispatch) return null;
  return gs.dispatch(Actions.ENEMY_DAMAGE, payload);
}

export function applyPlayerShieldState(gs, amount) {
  if (!gs?.dispatch) return null;
  return gs.dispatch(Actions.PLAYER_SHIELD, { amount });
}

export function applyPlayerDamageState(gs, payload = {}) {
  if (!gs?.dispatch) return null;
  return gs.dispatch(Actions.PLAYER_DAMAGE, payload);
}

export function applyEnemyStatusState(gs, payload = {}) {
  if (!gs?.dispatch) return null;
  return gs.dispatch(Actions.ENEMY_STATUS, payload);
}
