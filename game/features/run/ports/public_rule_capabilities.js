import {
  finalizeRunOutcome,
  getBaseRegionIndex,
  getRegionCount,
  getRegionData,
  getRegionIdForStage,
  RunRules,
} from '../application/run_rules.js';

export function createRunRuleCapabilities() {
  return {
    finalizeRunOutcome,
    getBaseRegionIndex,
    getRegionCount,
    getRegionData,
    getRegionIdForStage,
    RunRules,
  };
}

export {
  finalizeRunOutcome,
  getBaseRegionIndex,
  getRegionCount,
  getRegionData,
  getRegionIdForStage,
  RunRules,
};
