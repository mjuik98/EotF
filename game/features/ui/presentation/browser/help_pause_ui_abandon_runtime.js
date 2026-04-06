import { cleanupCombatAfterAbandon } from '../../integration/combat_capabilities.js';
import { confirmHelpPauseAbandonRun } from '../../integration/title_help_pause_capabilities.js';
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
