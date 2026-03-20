import { Actions } from '../../core/store/state_actions.js';
import {
  applyPlayerBuffLegacyFallback,
  applyPlayerEchoLegacyFallback,
  applyPlayerEnergyAdjustLegacyFallback,
  applyPlayerEnergySetLegacyFallback,
  applyPlayerGoldLegacyFallback,
  applyPlayerHealLegacyFallback,
  applyPlayerHpSetLegacyFallback,
  applyPlayerMaxEnergyGrowthLegacyFallback,
  applyPlayerMaxEnergySetLegacyFallback,
  applyPlayerMaxHpGrowthLegacyFallback,
  applyPlayerMaxHpSetLegacyFallback,
  applyPlayerShieldLegacyFallback,
  applyPlayerSilenceGaugeLegacyFallback,
  applyPlayerStatusClearLegacyFallback,
  applyPlayerTimeRiftGaugeLegacyFallback,
} from '../../platform/legacy/state/player_state_command_legacy_adapter.js';
import { isLegacyPlayerStateCommandFallbackEnabled } from './player_state_command_fallback_flag.js';

export const PlayerStateActions = Actions;

function clampNonNegative(value) {
  return Math.max(0, Number(value) || 0);
}

function selectPlayerState(gs) {
  return gs?.player || null;
}

function dispatchStateCommand(gs, action, payload) {
  if (typeof gs?.dispatch !== 'function') {
    return { handled: false, result: null };
  }

  const result = gs.dispatch(action, payload);
  return {
    handled: result !== undefined && result !== null,
    result: result ?? null,
  };
}

export function applyPlayerHealState(gs, amount) {
  const dispatched = dispatchStateCommand(gs, Actions.PLAYER_HEAL, { amount });
  if (dispatched.handled) return dispatched.result;
  if (!isLegacyPlayerStateCommandFallbackEnabled(gs)) return null;
  return applyPlayerHealLegacyFallback(gs, amount);
}

export function applyPlayerShieldState(gs, amount) {
  const dispatched = dispatchStateCommand(gs, Actions.PLAYER_SHIELD, { amount });
  if (dispatched.handled) return dispatched.result;
  if (!isLegacyPlayerStateCommandFallbackEnabled(gs)) return null;
  return applyPlayerShieldLegacyFallback(gs, amount);
}

export function setPlayerEchoState(gs, amount) {
  const player = selectPlayerState(gs);
  if (!player) return null;

  const nextEcho = Math.max(0, Math.min(Number(player.maxEcho || 0), Number(amount) || 0));
  const delta = nextEcho - clampNonNegative(player.echo);
  const dispatched = dispatchStateCommand(gs, Actions.PLAYER_ECHO, { amount: delta });
  if (dispatched.handled) return dispatched.result;
  if (!isLegacyPlayerStateCommandFallbackEnabled(gs)) return null;
  return applyPlayerEchoLegacyFallback(gs, nextEcho);
}

export function adjustPlayerSilenceGaugeState(gs, amount) {
  const dispatched = dispatchStateCommand(gs, Actions.PLAYER_SILENCE, { amount });
  if (dispatched.handled) return dispatched.result;
  if (!isLegacyPlayerStateCommandFallbackEnabled(gs)) return null;
  return applyPlayerSilenceGaugeLegacyFallback(gs, amount);
}

export function adjustPlayerTimeRiftGaugeState(gs, amount) {
  const dispatched = dispatchStateCommand(gs, Actions.PLAYER_TIME_RIFT, { amount });
  if (dispatched.handled) return dispatched.result;
  if (!isLegacyPlayerStateCommandFallbackEnabled(gs)) return null;
  return applyPlayerTimeRiftGaugeLegacyFallback(gs, amount);
}

export function applyPlayerBuffState(gs, id, stacks, data = {}) {
  const player = selectPlayerState(gs);
  if (!player || !id) return null;

  if (typeof gs?.dispatch === 'function') {
    const result = gs.dispatch(Actions.PLAYER_BUFF, { id, stacks, data });
    if (result !== undefined && result !== null) return result;
    if (player.buffs?.[id]) return player.buffs[id];
  }
  if (!isLegacyPlayerStateCommandFallbackEnabled(gs)) return null;
  return applyPlayerBuffLegacyFallback(gs, id, stacks, data);
}

export function applyPlayerGoldState(gs, amount) {
  const dispatched = dispatchStateCommand(gs, Actions.PLAYER_GOLD, { amount });
  if (dispatched.handled) return dispatched.result;
  if (!isLegacyPlayerStateCommandFallbackEnabled(gs)) return null;
  return applyPlayerGoldLegacyFallback(gs, amount);
}

export function applyPlayerMaxHpGrowthState(gs, amount) {
  const dispatched = dispatchStateCommand(gs, Actions.PLAYER_MAX_HP_GROWTH, { amount });
  if (dispatched.handled) return dispatched.result;
  if (!isLegacyPlayerStateCommandFallbackEnabled(gs)) return null;
  return applyPlayerMaxHpGrowthLegacyFallback(gs, amount);
}

export function applyPlayerMaxEnergyGrowthState(gs, amount, options = {}) {
  const dispatched = dispatchStateCommand(gs, Actions.PLAYER_MAX_ENERGY_GROWTH, { amount });
  if (dispatched.handled) return dispatched.result;
  if (!isLegacyPlayerStateCommandFallbackEnabled(gs)) return null;
  return applyPlayerMaxEnergyGrowthLegacyFallback(gs, amount, options);
}

export function setPlayerMaxEnergyState(gs, amount, options = {}) {
  const dispatched = dispatchStateCommand(gs, Actions.PLAYER_MAX_ENERGY_SET, {
    amount,
    maxEnergyCap: options.maxEnergyCap,
  });
  if (dispatched.handled) return dispatched.result;
  if (!isLegacyPlayerStateCommandFallbackEnabled(gs)) return null;
  return applyPlayerMaxEnergySetLegacyFallback(gs, amount, options);
}

export function changePlayerEnergyState(gs, amount) {
  const dispatched = dispatchStateCommand(gs, Actions.PLAYER_ENERGY_ADJUST, { amount });
  if (dispatched.handled) return dispatched.result;
  if (!isLegacyPlayerStateCommandFallbackEnabled(gs)) return null;
  return applyPlayerEnergyAdjustLegacyFallback(gs, amount);
}

export function setPlayerEnergyState(gs, amount) {
  const dispatched = dispatchStateCommand(gs, Actions.PLAYER_ENERGY_SET, { amount });
  if (dispatched.handled) return dispatched.result;
  if (!isLegacyPlayerStateCommandFallbackEnabled(gs)) return null;
  return applyPlayerEnergySetLegacyFallback(gs, amount);
}

export function setPlayerHpState(gs, amount) {
  const dispatched = dispatchStateCommand(gs, Actions.PLAYER_HP_SET, { amount });
  if (dispatched.handled) return dispatched.result;
  if (!isLegacyPlayerStateCommandFallbackEnabled(gs)) return null;
  return applyPlayerHpSetLegacyFallback(gs, amount);
}

export function setPlayerMaxHpState(gs, amount) {
  const dispatched = dispatchStateCommand(gs, Actions.PLAYER_MAX_HP_SET, { amount });
  if (dispatched.handled) return dispatched.result;
  if (!isLegacyPlayerStateCommandFallbackEnabled(gs)) return null;
  return applyPlayerMaxHpSetLegacyFallback(gs, amount);
}

export function clearPlayerStatusState(gs, statusId) {
  const dispatched = dispatchStateCommand(gs, Actions.PLAYER_STATUS_CLEAR, { statusId });
  if (dispatched.handled) return dispatched.result;
  if (!isLegacyPlayerStateCommandFallbackEnabled(gs)) return false;
  return applyPlayerStatusClearLegacyFallback(gs, statusId);
}
