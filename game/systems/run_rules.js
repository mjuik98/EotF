import { GAME } from '../core/global_bridge.js';
import {
  finalizeRunOutcome as finalizeFeatureRunOutcome,
  getBaseRegionIndex,
  getRegionCount,
  getRegionData,
  getRegionIdForStage,
  RunRules,
} from '../features/run/application/run_rules.js';

function getCompatGameState() {
  if (GAME.State) return GAME.State;
  if (typeof globalThis === 'undefined') return null;
  return globalThis.GS || globalThis.GameState || null;
}

export function finalizeRunOutcome(kind = 'defeat', options = {}, deps = {}) {
  return finalizeFeatureRunOutcome(kind, options, {
    getGameState: getCompatGameState,
    ...deps,
  });
}

export {
  getBaseRegionIndex,
  getRegionCount,
  getRegionData,
  getRegionIdForStage,
  RunRules,
};
