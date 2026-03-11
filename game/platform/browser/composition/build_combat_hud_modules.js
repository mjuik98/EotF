import { HudUpdateUI } from '../../../ui/hud/hud_update_ui.js';
import { FeedbackUI } from '../../../ui/hud/feedback_ui.js';
import { DomValueUI } from '../../../ui/hud/dom_value_ui.js';

export function buildCombatHudModules() {
  return {
    HudUpdateUI,
    FeedbackUI,
    DomValueUI,
  };
}
