import { Actions } from '../core_support/public_core_support_capabilities.js';
import { getDefaultState } from './runtime_context.js';
import { dispatchPlayerAction } from './player_state_dispatch.js';

export function applyPlayerDamage(amount, gs = getDefaultState()) {
  if (amount <= 0) return;
  if (typeof gs.takeDamage === 'function') {
    gs.takeDamage(amount);
    return;
  }
  dispatchPlayerAction(gs, Actions.PLAYER_DAMAGE, { amount, source: 'api' });
}

export function addShield(amount, gs = getDefaultState()) {
  if (amount <= 0) return;
  if (typeof gs.addShield === 'function') {
    gs.addShield(amount);
    return;
  }
  dispatchPlayerAction(gs, Actions.PLAYER_SHIELD, { amount });
}

export function healPlayer(amount, gs = getDefaultState()) {
  if (amount <= 0) return;
  if (typeof gs.heal === 'function') {
    gs.heal(amount);
    return;
  }
  dispatchPlayerAction(gs, Actions.PLAYER_HEAL, { amount });
}
