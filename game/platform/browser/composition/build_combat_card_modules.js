import { CardUI } from '../../../ui/cards/card_ui.js';
import { CardTargetUI } from '../../../ui/cards/card_target_ui.js';
import { TooltipUI } from '../../../ui/cards/tooltip_ui.js';
import { DeckModalUI } from '../../../ui/cards/deck_modal_ui.js';

export function buildCombatCardModules() {
  return {
    CardUI,
    CardTargetUI,
    TooltipUI,
    DeckModalUI,
  };
}
