import { confirmHelpPauseAbandonRun } from '../../../title/application/help_pause_abandon_actions.js';

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
