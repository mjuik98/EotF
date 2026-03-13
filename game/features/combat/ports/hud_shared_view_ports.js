export { ButtonFeedback } from '../../../platform/browser/effects/button_feedback.js';
import { StatusTooltipUI } from '../presentation/browser/status_tooltip_builder.js';
import { renderFloatingPlayerHpPanel as renderSharedFloatingPlayerHpPanel } from '../../../shared/ui/player_hp_panel/public.js';

export function renderFloatingPlayerHpPanel(deps = {}) {
  return renderSharedFloatingPlayerHpPanel({
    ...deps,
    StatusTooltipUI: deps.StatusTooltipUI || StatusTooltipUI,
  });
}
