import { confirmHelpPauseAbandonRun } from '../../../title/ports/public_help_pause_application_capabilities.js';

function removeFloatingPlayerHpPanel(deps = {}) {
  const doc = deps.doc || deps.win?.document || null;
  doc?.getElementById?.('ncFloatingHpShell')?.remove?.();
  return null;
}

export function confirmAbandonRun(deps = {}, onClosePauseMenu = () => {}) {
  return confirmHelpPauseAbandonRun({
    ...deps,
    removeFloatingPlayerHpPanel,
  }, onClosePauseMenu);
}
