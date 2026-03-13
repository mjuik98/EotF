import { SaveSystem } from '../../../shared/save/public.js';
import {
  createFinalizeRunOutcomeAction,
  RunRules,
  getRegionData,
  getBaseRegionIndex,
  getRegionCount,
} from '../../../features/run/public.js';

function getCurrentGameState() {
  if (typeof globalThis === 'undefined') return null;
  return globalThis.GS || globalThis.GameState || null;
}

export function buildCoreRunSystemModules() {
  return {
    SaveSystem,
    RunRules,
    getRegionData,
    getBaseRegionIndex,
    getRegionCount,
    finalizeRunOutcome: createFinalizeRunOutcomeAction(SaveSystem, getCurrentGameState),
  };
}
