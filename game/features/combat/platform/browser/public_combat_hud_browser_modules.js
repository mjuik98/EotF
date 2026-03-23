import {
  DomValueUI,
  FeedbackUI,
} from '../../presentation/browser/feedback/public_feedback_modules.js';
import { HudUpdateUI } from '../../presentation/browser/hud/public_combat_hud_modules.js';

export function buildCombatHudBrowserModules() {
  return {
    HudUpdateUI,
    FeedbackUI,
    DomValueUI,
  };
}
