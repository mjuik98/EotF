import { CombatStartUI } from '../../ui/combat/combat_start_ui.js';
import { CombatUI } from '../../ui/combat/combat_ui.js';
import { CombatHudUI } from '../../ui/combat/combat_hud_ui.js';
import { EchoSkillUI } from '../../ui/combat/echo_skill_ui.js';
import { CombatTurnUI } from '../../ui/combat/combat_turn_ui.js';
import { StatusEffectsUI } from '../../ui/combat/status_effects_ui.js';
import { CombatInfoUI } from '../../ui/combat/combat_info_ui.js';
import { CombatActionsUI } from '../../ui/combat/combat_actions_ui.js';

import { CardUI } from '../../ui/cards/card_ui.js';
import { CardTargetUI } from '../../ui/cards/card_target_ui.js';
import { TooltipUI } from '../../ui/cards/tooltip_ui.js';
import { DeckModalUI } from '../../ui/cards/deck_modal_ui.js';

import { HudUpdateUI } from '../../ui/hud/hud_update_ui.js';
import { FeedbackUI } from '../../ui/hud/feedback_ui.js';
import { DomValueUI } from '../../ui/hud/dom_value_ui.js';

export function registerCombatModules() {
  return {
    CombatStartUI,
    CombatUI,
    CombatHudUI,
    EchoSkillUI,
    CombatTurnUI,
    StatusEffectsUI,
    CombatInfoUI,
    CombatActionsUI,
    CardUI,
    CardTargetUI,
    TooltipUI,
    DeckModalUI,
    HudUpdateUI,
    FeedbackUI,
    DomValueUI,
  };
}
