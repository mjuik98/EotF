import { EndingScreenUI } from '../../../ui/ports/public_ending_presentation_capabilities.js';

export function showAbandonOutcome(deps = {}) {
  return EndingScreenUI.showOutcome('abandon', deps);
}
