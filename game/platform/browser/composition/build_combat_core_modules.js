import { CombatStartUI } from '../../../ui/combat/combat_start_ui.js';
import { CombatUI } from '../../../ui/combat/combat_ui.js';
import { CombatHudUI } from '../../../ui/combat/combat_hud_ui.js';
import { EchoSkillUI } from '../../../ui/combat/echo_skill_ui.js';
import { CombatTurnUI } from '../../../ui/combat/combat_turn_ui.js';
import { StatusEffectsUI } from '../../../ui/combat/status_effects_ui.js';
import { CombatInfoUI } from '../../../ui/combat/combat_info_ui.js';
import { CombatActionsUI } from '../../../ui/combat/combat_actions_ui.js';

export function buildCombatCoreModules() {
  return {
    CombatStartUI,
    CombatUI,
    CombatHudUI,
    EchoSkillUI,
    CombatTurnUI,
    StatusEffectsUI,
    CombatInfoUI,
    CombatActionsUI,
  };
}
