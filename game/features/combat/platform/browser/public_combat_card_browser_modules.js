import { CardTargetUI } from '../../presentation/browser/card_target_ui.js';
import { CardUI } from '../../presentation/browser/card_ui.js';
import { TooltipUI } from '../../presentation/browser/tooltip_ui.js';
import { createLazyDeckModalModule } from './create_lazy_deck_modal_module.js';

export function buildCombatCardBrowserModules() {
  return {
    CardUI,
    CardTargetUI,
    TooltipUI,
    DeckModalUI: createLazyDeckModalModule(),
  };
}
