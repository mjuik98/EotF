import { RandomUtils } from '../../../utils/random_utils.js';
import { CardCostUtils } from '../../../utils/card_cost_utils.js';
import { DescriptionUtils } from '../../../utils/description_utils.js';

export function buildCoreUtilityModules() {
  return {
    RandomUtils,
    CardCostUtils,
    DescriptionUtils,
  };
}
