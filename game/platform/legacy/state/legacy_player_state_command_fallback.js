import { LEGACY_PLAYER_STATE_FALLBACK_FLAG } from '../../../shared/state/player_state_command_fallback_flag.js';
import {
  applyLegacyPlayerGoldMutation,
  applyLegacyPlayerHealMutation,
  applyLegacyPlayerMaxEnergyGrowthMutation,
  applyLegacyPlayerMaxHpGrowthMutation,
} from './legacy_player_state_command_mutations.js';
import {
  applyPlayerGoldState,
  applyPlayerHealState,
  applyPlayerMaxEnergyGrowthState,
  applyPlayerMaxHpGrowthState,
} from '../../../shared/state/player_state_commands.js';

export function enableLegacyPlayerStateCommandFallback(gs) {
  if (gs && typeof gs === 'object') {
    gs[LEGACY_PLAYER_STATE_FALLBACK_FLAG] = true;
  }
  return gs;
}

export function applyLegacyPlayerGoldState(state, amount, options = {}) {
  if (options.forceLegacy) return applyLegacyPlayerGoldMutation(enableLegacyPlayerStateCommandFallback(state), amount);
  return applyPlayerGoldState(enableLegacyPlayerStateCommandFallback(state), amount);
}

export function applyLegacyPlayerHealState(state, amount, options = {}) {
  if (options.forceLegacy) return applyLegacyPlayerHealMutation(enableLegacyPlayerStateCommandFallback(state), amount);
  return applyPlayerHealState(enableLegacyPlayerStateCommandFallback(state), amount);
}

export function applyLegacyPlayerMaxEnergyGrowthState(state, amount, options = {}, legacyOptions = {}) {
  if (legacyOptions.forceLegacy) {
    return applyLegacyPlayerMaxEnergyGrowthMutation(enableLegacyPlayerStateCommandFallback(state), amount, options);
  }
  return applyPlayerMaxEnergyGrowthState(enableLegacyPlayerStateCommandFallback(state), amount, options);
}

export function applyLegacyPlayerMaxHpGrowthState(state, amount, options = {}) {
  if (options.forceLegacy) return applyLegacyPlayerMaxHpGrowthMutation(enableLegacyPlayerStateCommandFallback(state), amount);
  return applyPlayerMaxHpGrowthState(enableLegacyPlayerStateCommandFallback(state), amount);
}
