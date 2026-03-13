import { bindSaveStorage, SaveSystem } from '../../../shared/save/public.js';
import { GS } from '../../../core/game_state.js';
import { SaveAdapter } from '../../storage/save_adapter.js';
import { RunPublicSurface } from '../../../features/run/public.js';

export function buildCoreRunSystemModules() {
  bindSaveStorage(SaveAdapter);

  return {
    SaveSystem,
    RunRules: RunPublicSurface.RunRules,
    getRegionData: RunPublicSurface.getRegionData,
    getBaseRegionIndex: RunPublicSurface.getBaseRegionIndex,
    getRegionCount: RunPublicSurface.getRegionCount,
    finalizeRunOutcome: RunPublicSurface.createFinalizeRunOutcomeAction(SaveSystem, () => GS),
  };
}
