import { Actions } from '../../core/store/state_actions.js';
import {
  applyPlayerGoldCompatFallback,
  applyPlayerHealCompatFallback,
  applyPlayerMaxEnergyGrowthCompatFallback,
  applyPlayerMaxHpGrowthCompatFallback,
  enablePlayerStateLegacyCompat,
  recordPlayerStateLegacyCompatBridge,
  runPlayerStateLegacyFallback,
} from '../../platform/legacy/state/player_state_command_legacy_adapter.js';

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

function runStateCommand(gs, action, payload, fallbackName, fallbackArgs = [], emptyResult = null) {
  const dispatched = dispatchStateCommand(gs, action, payload);
  if (dispatched.handled) return dispatched.result;
  return runPlayerStateLegacyFallback(gs, fallbackName, fallbackArgs, emptyResult);
}

function shouldTrustCompatResult(gs, beforeValues, afterValues) {
  if (typeof gs?.isDispatching === 'function') return true;
  return afterValues.some((value, index) => value !== beforeValues[index]);
}

export function applyPlayerHealState(gs, amount) {
  return runStateCommand(gs, Actions.PLAYER_HEAL, { amount }, 'applyPlayerHealState', [amount]);
}

export function applyPlayerShieldState(gs, amount) {
  return runStateCommand(gs, Actions.PLAYER_SHIELD, { amount }, 'applyPlayerShieldState', [amount]);
}

export function setPlayerEchoState(gs, amount) {
  const player = selectPlayerState(gs);
  if (!player) return null;

  const nextEcho = Math.max(0, Math.min(Number(player.maxEcho || 0), Number(amount) || 0));
  const delta = nextEcho - clampNonNegative(player.echo);
  return runStateCommand(gs, Actions.PLAYER_ECHO, { amount: delta }, 'applyPlayerEchoState', [nextEcho]);
}

export function adjustPlayerSilenceGaugeState(gs, amount) {
  return runStateCommand(gs, Actions.PLAYER_SILENCE, { amount }, 'applyPlayerSilenceGaugeState', [amount]);
}

export function adjustPlayerTimeRiftGaugeState(gs, amount) {
  return runStateCommand(gs, Actions.PLAYER_TIME_RIFT, { amount }, 'applyPlayerTimeRiftGaugeState', [amount]);
}

export function applyPlayerBuffState(gs, id, stacks, data = {}) {
  const player = selectPlayerState(gs);
  if (!player || !id) return null;

  if (typeof gs?.dispatch === 'function') {
    const result = gs.dispatch(Actions.PLAYER_BUFF, { id, stacks, data });
    if (result !== undefined && result !== null) return result;
    if (player.buffs?.[id]) return player.buffs[id];
  }
  return runPlayerStateLegacyFallback(gs, 'applyPlayerBuffState', [id, stacks, data], null);
}

export function applyPlayerGoldState(gs, amount) {
  return runStateCommand(gs, Actions.PLAYER_GOLD, { amount }, 'applyPlayerGoldState', [amount]);
}

export function applyPlayerMaxHpGrowthState(gs, amount) {
  return runStateCommand(gs, Actions.PLAYER_MAX_HP_GROWTH, { amount }, 'applyPlayerMaxHpGrowthState', [amount]);
}

export function applyPlayerMaxEnergyGrowthState(gs, amount, options = {}) {
  return runStateCommand(
    gs,
    Actions.PLAYER_MAX_ENERGY_GROWTH,
    { amount },
    'applyPlayerMaxEnergyGrowthState',
    [amount, options],
  );
}

export function setPlayerMaxEnergyState(gs, amount, options = {}) {
  return runStateCommand(
    gs,
    Actions.PLAYER_MAX_ENERGY_SET,
    {
      amount,
      maxEnergyCap: options.maxEnergyCap,
    },
    'applyPlayerMaxEnergySetState',
    [amount, options],
  );
}

export function changePlayerEnergyState(gs, amount) {
  return runStateCommand(gs, Actions.PLAYER_ENERGY_ADJUST, { amount }, 'applyPlayerEnergyAdjustState', [amount]);
}

export function setPlayerEnergyState(gs, amount) {
  return runStateCommand(gs, Actions.PLAYER_ENERGY_SET, { amount }, 'applyPlayerEnergySetState', [amount]);
}

export function setPlayerHpState(gs, amount) {
  return runStateCommand(gs, Actions.PLAYER_HP_SET, { amount }, 'applyPlayerHpSetState', [amount]);
}

export function setPlayerMaxHpState(gs, amount) {
  return runStateCommand(gs, Actions.PLAYER_MAX_HP_SET, { amount }, 'applyPlayerMaxHpSetState', [amount]);
}

export function clearPlayerStatusState(gs, statusId) {
  return runStateCommand(
    gs,
    Actions.PLAYER_STATUS_CLEAR,
    { statusId },
    'applyPlayerStatusClearState',
    [statusId],
    false,
  );
}

export function applyPlayerGoldCompatState(gs, amount) {
  recordPlayerStateLegacyCompatBridge('applyPlayerGoldState');
  const state = enablePlayerStateLegacyCompat(gs);
  const goldBefore = Number(state?.player?.gold || 0);
  const result = applyPlayerGoldState(state, amount);
  const goldAfter = Number(state?.player?.gold || 0);

  if (shouldTrustCompatResult(state, [goldBefore], [goldAfter])) {
    return result ?? { delta: goldAfter - goldBefore, goldAfter };
  }
  return applyPlayerGoldCompatFallback(state, amount);
}

export function applyPlayerHealCompatState(gs, amount) {
  recordPlayerStateLegacyCompatBridge('applyPlayerHealState');
  const state = enablePlayerStateLegacyCompat(gs);
  const hpBefore = Number(state?.player?.hp || 0);
  const result = applyPlayerHealState(state, amount);
  const hpAfter = Number(state?.player?.hp || 0);

  if (shouldTrustCompatResult(state, [hpBefore], [hpAfter])) {
    return result ?? { healed: Math.max(0, hpAfter - hpBefore), hpAfter };
  }
  return applyPlayerHealCompatFallback(state, amount);
}

export function applyPlayerMaxEnergyGrowthCompatState(gs, amount, options = {}) {
  recordPlayerStateLegacyCompatBridge('applyPlayerMaxEnergyGrowthState');
  const state = enablePlayerStateLegacyCompat(gs);
  const maxEnergyBefore = Number(state?.player?.maxEnergy || 0);
  const energyBefore = Number(state?.player?.energy || 0);
  const result = applyPlayerMaxEnergyGrowthState(state, amount, options);
  const maxEnergyAfter = Number(state?.player?.maxEnergy || 0);
  const energyAfter = Number(state?.player?.energy || 0);

  if (shouldTrustCompatResult(state, [maxEnergyBefore, energyBefore], [maxEnergyAfter, energyAfter])) {
    return result ?? { maxEnergyAfter, energyAfter };
  }
  return applyPlayerMaxEnergyGrowthCompatFallback(state, amount, options);
}

export function applyPlayerMaxHpGrowthCompatState(gs, amount) {
  recordPlayerStateLegacyCompatBridge('applyPlayerMaxHpGrowthState');
  const state = enablePlayerStateLegacyCompat(gs);
  const maxHpBefore = Number(state?.player?.maxHp || 0);
  const hpBefore = Number(state?.player?.hp || 0);
  const result = applyPlayerMaxHpGrowthState(state, amount);
  const maxHpAfter = Number(state?.player?.maxHp || 0);
  const hpAfter = Number(state?.player?.hp || 0);

  if (shouldTrustCompatResult(state, [maxHpBefore, hpBefore], [maxHpAfter, hpAfter])) {
    return result ?? { maxHpAfter, hpAfter };
  }
  return applyPlayerMaxHpGrowthCompatFallback(state, amount);
}
