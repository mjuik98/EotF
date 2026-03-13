import { SaveSystem } from '../../../shared/save/public.js';
import {
  RunRules,
  getRegionData,
  getBaseRegionIndex,
  getRegionCount,
  finalizeRunOutcome,
} from '../../../features/run/public.js';
import { bindFinalizeRunOutcome } from '../../../features/run/application/bind_run_outcome_action.js';

export function buildCoreRunSystemModules() {
  return {
    SaveSystem,
    RunRules,
    getRegionData,
    getBaseRegionIndex,
    getRegionCount,
    finalizeRunOutcome: bindFinalizeRunOutcome(finalizeRunOutcome, SaveSystem),
  };
}
