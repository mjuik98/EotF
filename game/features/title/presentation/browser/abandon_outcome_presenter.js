import { EndingScreenUI } from '../../../ui/ports/ending_screen_runtime_ports.js';

export function showAbandonOutcome(deps = {}) {
  return EndingScreenUI.showOutcome('abandon', deps);
}
