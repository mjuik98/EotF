import { isLegacyPlayerStateCommandFallbackEnabled } from './player_state_command_fallback_flag.js';
import {
  applyLegacyPlayerGoldState,
  applyLegacyPlayerHealState,
  applyLegacyPlayerMaxEnergyGrowthState,
  applyLegacyPlayerMaxHpGrowthState,
  enableLegacyPlayerStateCommandFallback,
} from './legacy_player_state_command_fallback.js';
import {
  applyLegacyPlayerBuffMutation,
  applyLegacyPlayerEchoMutation,
  applyLegacyPlayerEnergyAdjustMutation,
  applyLegacyPlayerEnergySetMutation,
  applyLegacyPlayerGoldMutation,
  applyLegacyPlayerHealMutation,
  applyLegacyPlayerHpSetMutation,
  applyLegacyPlayerMaxEnergyGrowthMutation,
  applyLegacyPlayerMaxEnergySetMutation,
  applyLegacyPlayerMaxHpGrowthMutation,
  applyLegacyPlayerMaxHpSetMutation,
  applyLegacyPlayerShieldMutation,
  applyLegacyPlayerSilenceGaugeMutation,
  applyLegacyPlayerStatusClearMutation,
  applyLegacyPlayerTimeRiftGaugeMutation,
} from './legacy_player_state_command_mutations.js';

export function applyPlayerBuffLegacyFallback(gs, id, stacks, data = {}) {
  return applyLegacyPlayerBuffMutation(gs, id, stacks, data);
}

export function applyPlayerEchoLegacyFallback(gs, amount) {
  return applyLegacyPlayerEchoMutation(gs, amount);
}

export function applyPlayerEnergyAdjustLegacyFallback(gs, amount) {
  return applyLegacyPlayerEnergyAdjustMutation(gs, amount);
}

export function applyPlayerEnergySetLegacyFallback(gs, amount) {
  return applyLegacyPlayerEnergySetMutation(gs, amount);
}

export function applyPlayerGoldLegacyFallback(gs, amount) {
  return applyLegacyPlayerGoldMutation(gs, amount);
}

export function applyPlayerHealLegacyFallback(gs, amount) {
  return applyLegacyPlayerHealMutation(gs, amount);
}

export function applyPlayerHpSetLegacyFallback(gs, amount) {
  return applyLegacyPlayerHpSetMutation(gs, amount);
}

export function applyPlayerMaxEnergyGrowthLegacyFallback(gs, amount, options = {}) {
  return applyLegacyPlayerMaxEnergyGrowthMutation(gs, amount, options);
}

export function applyPlayerMaxEnergySetLegacyFallback(gs, amount, options = {}) {
  return applyLegacyPlayerMaxEnergySetMutation(gs, amount, options);
}

export function applyPlayerMaxHpGrowthLegacyFallback(gs, amount) {
  return applyLegacyPlayerMaxHpGrowthMutation(gs, amount);
}

export function applyPlayerMaxHpSetLegacyFallback(gs, amount) {
  return applyLegacyPlayerMaxHpSetMutation(gs, amount);
}

export function applyPlayerShieldLegacyFallback(gs, amount) {
  return applyLegacyPlayerShieldMutation(gs, amount);
}

export function applyPlayerSilenceGaugeLegacyFallback(gs, amount) {
  return applyLegacyPlayerSilenceGaugeMutation(gs, amount);
}

export function applyPlayerStatusClearLegacyFallback(gs, statusId) {
  return applyLegacyPlayerStatusClearMutation(gs, statusId);
}

export function applyPlayerTimeRiftGaugeLegacyFallback(gs, amount) {
  return applyLegacyPlayerTimeRiftGaugeMutation(gs, amount);
}

export const LegacyPlayerStateCommandFallbacks = Object.freeze({
  applyPlayerBuffState: applyPlayerBuffLegacyFallback,
  applyPlayerEchoState: applyPlayerEchoLegacyFallback,
  applyPlayerEnergyAdjustState: applyPlayerEnergyAdjustLegacyFallback,
  applyPlayerEnergySetState: applyPlayerEnergySetLegacyFallback,
  applyPlayerGoldState: applyPlayerGoldLegacyFallback,
  applyPlayerHealState: applyPlayerHealLegacyFallback,
  applyPlayerHpSetState: applyPlayerHpSetLegacyFallback,
  applyPlayerMaxEnergyGrowthState: applyPlayerMaxEnergyGrowthLegacyFallback,
  applyPlayerMaxEnergySetState: applyPlayerMaxEnergySetLegacyFallback,
  applyPlayerMaxHpGrowthState: applyPlayerMaxHpGrowthLegacyFallback,
  applyPlayerMaxHpSetState: applyPlayerMaxHpSetLegacyFallback,
  applyPlayerShieldState: applyPlayerShieldLegacyFallback,
  applyPlayerSilenceGaugeState: applyPlayerSilenceGaugeLegacyFallback,
  applyPlayerStatusClearState: applyPlayerStatusClearLegacyFallback,
  applyPlayerTimeRiftGaugeState: applyPlayerTimeRiftGaugeLegacyFallback,
});

export function enablePlayerStateLegacyCompat(gs) {
  return enableLegacyPlayerStateCommandFallback(gs);
}

export function applyPlayerGoldCompatFallback(gs, amount) {
  return applyLegacyPlayerGoldState(enablePlayerStateLegacyCompat(gs), amount, { forceLegacy: true });
}

export function applyPlayerHealCompatFallback(gs, amount) {
  return applyLegacyPlayerHealState(enablePlayerStateLegacyCompat(gs), amount, { forceLegacy: true });
}

export function applyPlayerMaxEnergyGrowthCompatFallback(gs, amount, options = {}) {
  return applyLegacyPlayerMaxEnergyGrowthState(
    enablePlayerStateLegacyCompat(gs),
    amount,
    options,
    { forceLegacy: true },
  );
}

export function applyPlayerMaxHpGrowthCompatFallback(gs, amount) {
  return applyLegacyPlayerMaxHpGrowthState(enablePlayerStateLegacyCompat(gs), amount, { forceLegacy: true });
}

export function runPlayerStateLegacyFallback(gs, fallbackName, fallbackArgs = [], emptyResult = null) {
  if (!isLegacyPlayerStateCommandFallbackEnabled(gs)) return emptyResult;

  const fallback = LegacyPlayerStateCommandFallbacks[fallbackName];
  if (typeof fallback !== 'function') return emptyResult;
  return fallback(gs, ...fallbackArgs);
}
