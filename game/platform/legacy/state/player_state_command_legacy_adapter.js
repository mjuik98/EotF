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
