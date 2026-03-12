import { EndingScreenUI } from '../../../../ui/screens/ending_screen_ui.js';

export function showAbandonOutcome(deps = {}) {
  return EndingScreenUI.showOutcome('abandon', deps);
}
