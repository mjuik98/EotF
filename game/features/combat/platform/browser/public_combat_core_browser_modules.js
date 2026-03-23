import { CombatActionsUI } from '../../presentation/browser/combat_actions_ui.js';
import { CombatInfoUI } from '../../presentation/browser/combat_info_ui.js';
import { CombatStartUI } from '../../presentation/browser/combat_start_ui.js';
import { CombatTurnUI } from '../../presentation/browser/combat_turn_ui.js';
import { CombatUI } from '../../presentation/browser/combat_ui.js';
import { EchoSkillUI } from '../../presentation/browser/echo_skill_ui.js';
import { StatusEffectsUI } from '../../presentation/browser/status_effects_ui.js';
import { CombatHudUI } from '../../presentation/browser/hud/public_combat_hud_modules.js';

export function buildCombatCoreBrowserModules() {
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
