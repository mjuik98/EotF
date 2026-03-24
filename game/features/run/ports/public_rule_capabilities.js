import {
  finalizeRunOutcome,
  getBaseRegionIndex,
  getRegionCount,
  getRegionData,
  getRegionIdForStage,
  RunRules,
} from '../application/run_rules.js';
import { resolveActiveRegionId } from '../domain/resolve_active_region_id.js';

export function createRunRuleCapabilities() {
  return {
    finalizeRunOutcome,
    getBaseRegionIndex,
    getRegionCount,
    getRegionData,
    getRegionIdForStage,
    resolveActiveRegionId,
    RunRules,
  };
}

export {
  finalizeRunOutcome,
  getBaseRegionIndex,
  getRegionCount,
  getRegionData,
  getRegionIdForStage,
  resolveActiveRegionId,
  RunRules,
};
