import { EndingScreenUI } from '../../integration/ui_support_capabilities.js';

export function showAbandonOutcome(deps = {}) {
  return EndingScreenUI.showOutcome('abandon', deps);
}
