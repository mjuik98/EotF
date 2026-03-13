import { GAME } from './public.js';
import { getLegacyRoot } from './global_bridge_helpers.js';
import {
  finalizeRunOutcome as finalizeFeatureRunOutcome,
  getBaseRegionIndex,
  getRegionCount,
  getRegionData,
  getRegionIdForStage,
  RunRules,
} from '../../features/run/public.js';

function getCompatGameState() {
  if (GAME.State) return GAME.State;
  const root = getLegacyRoot();
  return root?.GS || root?.GameState || null;
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
