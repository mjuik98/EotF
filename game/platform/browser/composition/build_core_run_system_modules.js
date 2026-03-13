import { bindSaveStorage, SaveSystem } from '../../../shared/save/public.js';
import { SaveAdapter } from '../../storage/save_adapter.js';
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
  bindSaveStorage(SaveAdapter);

  return {
    SaveSystem,
    RunRules,
    getRegionData,
    getBaseRegionIndex,
    getRegionCount,
    finalizeRunOutcome: createFinalizeRunOutcomeAction(SaveSystem, getCurrentGameState),
  };
}
