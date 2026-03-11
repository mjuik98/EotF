import { SaveSystem } from '../../../systems/save_system.js';
import {
  RunRules,
  getRegionData,
  getBaseRegionIndex,
  getRegionCount,
  finalizeRunOutcome,
} from '../../../systems/run_rules.js';
import { bindFinalizeRunOutcome } from '../../../features/run/app/bind_run_outcome_action.js';

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
