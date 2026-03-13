import { bindSaveStorage, SaveSystem } from '../../../shared/save/public.js';
import { GS } from '../../../core/game_state.js';
import { SaveAdapter } from '../../storage/save_adapter.js';
import { createRunSystemCapabilities } from '../../../features/run/ports/public_system_capabilities.js';

export function buildCoreRunSystemModules() {
  bindSaveStorage(SaveAdapter);
  const { rules, runtime } = createRunSystemCapabilities();

  return {
    SaveSystem,
    RunRules: rules.RunRules,
    getRegionData: rules.getRegionData,
    getBaseRegionIndex: rules.getBaseRegionIndex,
    getRegionCount: rules.getRegionCount,
    finalizeRunOutcome: runtime.createFinalizeOutcomeAction(SaveSystem, () => GS),
  };
}
