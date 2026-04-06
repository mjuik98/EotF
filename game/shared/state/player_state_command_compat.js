export {
  applyPlayerGoldState,
  applyPlayerHealState,
  applyPlayerMaxEnergyGrowthState,
  applyPlayerMaxHpGrowthState,
} from './player_state_commands.js';
import {
  applyPlayerGoldState,
  applyPlayerHealState,
  applyPlayerMaxEnergyGrowthState,
  applyPlayerMaxHpGrowthState,
} from './player_state_commands.js';
import {
  applyPlayerGoldCompatFallback,
  applyPlayerHealCompatFallback,
  applyPlayerMaxEnergyGrowthCompatFallback,
  applyPlayerMaxHpGrowthCompatFallback,
  enablePlayerStateLegacyCompat,
  recordPlayerStateLegacyCompatBridge,
} from './player_state_legacy_runtime_bridge.js';

function shouldTrustCompatResult(gs, beforeValues, afterValues) {
  if (typeof gs?.isDispatching === 'function') return true;
  return afterValues.some((value, index) => value !== beforeValues[index]);
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
