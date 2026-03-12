import { EndingScreenUI } from '../../../ui/presentation/browser/ending_screen_ui.js';

export function showAbandonOutcome(deps = {}) {
  return EndingScreenUI.showOutcome('abandon', deps);
}
