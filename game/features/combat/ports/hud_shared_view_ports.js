export { ButtonFeedback } from '../../../platform/browser/effects/button_feedback.js';
import { StatusTooltipUI } from '../presentation/browser/status_tooltip_builder.js';
import { renderFloatingPlayerHpPanel as renderSharedFloatingPlayerHpPanel } from './public_player_hp_panel_view_capabilities.js';

export function renderFloatingPlayerHpPanel(deps = {}) {
  return renderSharedFloatingPlayerHpPanel({
    ...deps,
    StatusTooltipUI: deps.StatusTooltipUI || StatusTooltipUI,
  });
}
