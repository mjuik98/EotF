import { cleanupCombatAfterAbandon } from '../../../combat/ports/public_combat_flow_application_capabilities.js';
import { confirmHelpPauseAbandonRun } from '../../../title/ports/public_help_pause_application_capabilities.js';
import { EndingScreenUI } from '../../ports/public_ending_presentation_capabilities.js';

function removeFloatingPlayerHpPanel(deps = {}) {
  const doc = deps.doc || deps.win?.document || null;
  doc?.getElementById?.('ncFloatingHpShell')?.remove?.();
  return null;
}

export function confirmAbandonRun(deps = {}, onClosePauseMenu = () => {}) {
  return confirmHelpPauseAbandonRun({
    ...deps,
    cleanupCombatAfterAbandon: deps.cleanupCombatAfterAbandon || cleanupCombatAfterAbandon,
    removeFloatingPlayerHpPanel,
    showAbandonOutcome: deps.showAbandonOutcome || ((nextDeps) => EndingScreenUI.showOutcome('abandon', nextDeps)),
  }, onClosePauseMenu);
}
