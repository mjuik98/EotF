import { LEGACY_PLAYER_STATE_FALLBACK_FLAG } from './player_state_command_fallback_flag.js';
import { Actions } from '../core_support/public_core_support_capabilities.js';
import {
  applyLegacyPlayerGoldMutation,
  applyLegacyPlayerHealMutation,
  applyLegacyPlayerMaxEnergyGrowthMutation,
  applyLegacyPlayerMaxHpGrowthMutation,
} from './legacy_player_state_command_mutations.js';

function dispatchLegacyPlayerStateAction(state, action, payload) {
  if (typeof state?.dispatch !== 'function') {
    return { handled: false, result: null };
  }

  const result = state.dispatch(action, payload);
  return {
    handled: result !== undefined && result !== null,
    result: result ?? null,
  };
}

export function enableLegacyPlayerStateCommandFallback(gs) {
  if (gs && typeof gs === 'object') {
    gs[LEGACY_PLAYER_STATE_FALLBACK_FLAG] = true;
  }
  return gs;
}

export function applyLegacyPlayerGoldState(state, amount, options = {}) {
  if (options.forceLegacy) return applyLegacyPlayerGoldMutation(enableLegacyPlayerStateCommandFallback(state), amount);
  const compatState = enableLegacyPlayerStateCommandFallback(state);
  const dispatched = dispatchLegacyPlayerStateAction(compatState, Actions.PLAYER_GOLD, { amount });
  if (dispatched.handled) return dispatched.result;
  return applyLegacyPlayerGoldMutation(compatState, amount);
}

export function applyLegacyPlayerHealState(state, amount, options = {}) {
  if (options.forceLegacy) return applyLegacyPlayerHealMutation(enableLegacyPlayerStateCommandFallback(state), amount);
  const compatState = enableLegacyPlayerStateCommandFallback(state);
  const dispatched = dispatchLegacyPlayerStateAction(compatState, Actions.PLAYER_HEAL, { amount });
  if (dispatched.handled) return dispatched.result;
  return applyLegacyPlayerHealMutation(compatState, amount);
}

export function applyLegacyPlayerMaxEnergyGrowthState(state, amount, options = {}, legacyOptions = {}) {
  const compatState = enableLegacyPlayerStateCommandFallback(state);
  if (legacyOptions.forceLegacy) {
    return applyLegacyPlayerMaxEnergyGrowthMutation(compatState, amount, options);
  }
  const dispatched = dispatchLegacyPlayerStateAction(compatState, Actions.PLAYER_MAX_ENERGY_GROWTH, { amount });
  if (dispatched.handled) return dispatched.result;
  return applyLegacyPlayerMaxEnergyGrowthMutation(compatState, amount, options);
}

export function applyLegacyPlayerMaxHpGrowthState(state, amount, options = {}) {
  const compatState = enableLegacyPlayerStateCommandFallback(state);
  if (options.forceLegacy) return applyLegacyPlayerMaxHpGrowthMutation(compatState, amount);
  const dispatched = dispatchLegacyPlayerStateAction(compatState, Actions.PLAYER_MAX_HP_GROWTH, { amount });
  if (dispatched.handled) return dispatched.result;
  return applyLegacyPlayerMaxHpGrowthMutation(compatState, amount);
}
