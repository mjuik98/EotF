import { DifficultyScaler } from '../../../combat/difficulty_scaler.js';
import { ClassMechanics } from '../../../domain/class/class_mechanics.js';
import { SetBonusSystem } from '../../../systems/set_bonus_system.js';
import { SaveSystem } from '../../../systems/save_system.js';
import {
  RunRules,
  getRegionData,
  getBaseRegionIndex,
  getRegionCount,
  finalizeRunOutcome,
} from '../../../systems/run_rules.js';
import { RandomUtils } from '../../../utils/random_utils.js';
import { CardCostUtils } from '../../../utils/card_cost_utils.js';
import { DescriptionUtils } from '../../../utils/description_utils.js';
import { bindFinalizeRunOutcome } from '../../../features/run/app/bind_run_outcome_action.js';

export function buildCoreSystemModules() {
  return {
    DifficultyScaler,
    ClassMechanics,
    SetBonusSystem,
    SaveSystem,
    RunRules,
    getRegionData,
    getBaseRegionIndex,
    getRegionCount,
    finalizeRunOutcome: bindFinalizeRunOutcome(finalizeRunOutcome, SaveSystem),
    RandomUtils,
    CardCostUtils,
    DescriptionUtils,
  };
}
