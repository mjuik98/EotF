import {
  hideGeneralTooltipUi,
  showGeneralTooltipUi,
} from '../../presentation/browser/tooltip_general_ui.js';
import {
  hideItemTooltipUi,
  showItemTooltipUi,
} from '../../presentation/browser/tooltip_item_ui.js';
import {
  extractTooltipCardId,
  positionCardTooltip,
  renderCardTooltipContent,
  syncCardKeywordTooltip,
} from '../../presentation/browser/tooltip_card_render_ui.js';

export function createCombatTooltipBrowserModules() {
  return {
    extractTooltipCardId,
    hideGeneralTooltipUi,
    hideItemTooltipUi,
    positionCardTooltip,
    renderCardTooltipContent,
    showGeneralTooltipUi,
    showItemTooltipUi,
    syncCardKeywordTooltip,
  };
}
