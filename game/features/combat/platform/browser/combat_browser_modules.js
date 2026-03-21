import { CardTargetUI } from '../../presentation/browser/card_target_ui.js';
import { CardUI } from '../../presentation/browser/card_ui.js';
import { CombatActionsUI } from '../../presentation/browser/combat_actions_ui.js';
import { CombatInfoUI } from '../../presentation/browser/combat_info_ui.js';
import { CombatStartUI } from '../../presentation/browser/combat_start_ui.js';
import { CombatTurnUI } from '../../presentation/browser/combat_turn_ui.js';
import { CombatUI } from '../../presentation/browser/combat_ui.js';
import { EchoSkillUI } from '../../presentation/browser/echo_skill_ui.js';
import { StatusEffectsUI } from '../../presentation/browser/status_effects_ui.js';
import { TooltipUI } from '../../presentation/browser/tooltip_ui.js';
import { DomValueUI, FeedbackUI } from '../../presentation/browser/feedback/public_feedback_modules.js';
import { CombatHudUI, HudUpdateUI } from '../../presentation/browser/hud/public_combat_hud_modules.js';
import { createLazyDeckModalModule } from './create_lazy_deck_modal_module.js';

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
    DeckModalUI: createLazyDeckModalModule(),
  };
}

export function buildCombatHudBrowserModules() {
  return {
    HudUpdateUI,
    FeedbackUI,
    DomValueUI,
  };
}
