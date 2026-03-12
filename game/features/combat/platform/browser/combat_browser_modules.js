import { CardTargetUI } from '../../presentation/browser/card_target_ui.js';
import { CardUI } from '../../presentation/browser/card_ui.js';
import { CombatActionsUI } from '../../presentation/browser/combat_actions_ui.js';
import { CombatHudUI } from '../../presentation/browser/combat_hud_ui.js';
import { CombatInfoUI } from '../../presentation/browser/combat_info_ui.js';
import { CombatStartUI } from '../../presentation/browser/combat_start_ui.js';
import { CombatTurnUI } from '../../presentation/browser/combat_turn_ui.js';
import { CombatUI } from '../../presentation/browser/combat_ui.js';
import { DeckModalUI } from '../../presentation/browser/deck_modal_ui.js';
import { EchoSkillUI } from '../../presentation/browser/echo_skill_ui.js';
import { StatusEffectsUI } from '../../presentation/browser/status_effects_ui.js';
import { TooltipUI } from '../../presentation/browser/tooltip_ui.js';
import { HudUpdateUI } from '../../presentation/browser/hud_update_ui.js';
import { FeedbackUI } from '../../presentation/browser/feedback_ui.js';
import { DomValueUI } from '../../presentation/browser/dom_value_ui.js';

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

export function buildCombatCardBrowserModules() {
  return {
    CardUI,
    CardTargetUI,
    TooltipUI,
    DeckModalUI,
  };
}

export function buildCombatHudBrowserModules() {
  return {
    HudUpdateUI,
    FeedbackUI,
    DomValueUI,
  };
}
