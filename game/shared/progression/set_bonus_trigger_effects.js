import {
  normalizeTrigger,
} from './set_bonus_helpers.js';
import { applySetBonusDamageRules } from './set_bonus_damage_rules.js';
import { applySetBonusResourceRules } from './set_bonus_resource_rules.js';
import { applySetBonusSurvivalRules } from './set_bonus_survival_rules.js';
import { applySetBonusSessionState } from './set_bonus_trigger_session_state.js';

export function triggerSetBonusEffects(gs, counts, trigger, data) {
  const normalizedTrigger = normalizeTrigger(trigger);
  applySetBonusSessionState(gs, normalizedTrigger);

  const resourceResult = applySetBonusResourceRules(gs, counts, normalizedTrigger, data);
  if (resourceResult !== undefined) return resourceResult;

  const survivalResult = applySetBonusSurvivalRules(gs, counts, normalizedTrigger, data);
  if (survivalResult !== undefined) return survivalResult;

  return applySetBonusDamageRules(gs, counts, normalizedTrigger, data);
}
