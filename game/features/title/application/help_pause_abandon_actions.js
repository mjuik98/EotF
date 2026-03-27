import { cleanupCombatAfterAbandon } from '../../combat/ports/public_application_capabilities.js';
import { showAbandonOutcome } from '../ports/public_help_pause_presentation_capabilities.js';

function resolveDoc(deps = {}) {
  return deps.doc || deps.win?.document || null;
}

function resolveGs(deps = {}) {
  return deps.gs || deps.state || deps.State || null;
}

function clearActiveRunSave(deps = {}) {
  if (typeof deps.clearActiveRunSave === 'function') {
    deps.clearActiveRunSave();
    return;
  }

  const saveSystem = deps.saveSystem || deps.SaveSystem || null;
  saveSystem?.clearSave?.();
}

export function confirmHelpPauseAbandonRun(deps = {}, onClosePauseMenu = () => {}) {
  const gs = resolveGs(deps);
  if (!gs) return false;

  const doc = resolveDoc(deps);
  doc?.getElementById?.('abandonConfirm')?.remove();
  onClosePauseMenu(doc);

  cleanupCombatAfterAbandon({ ...deps, doc, gs });
  deps.removeFloatingPlayerHpPanel?.({ doc });

  if (typeof deps.finalizeRunOutcome === 'function') {
    deps.finalizeRunOutcome('defeat', { echoFragments: 2, abandoned: true }, { gs });
  }

  clearActiveRunSave(deps);
  const presentAbandonOutcome = deps.showAbandonOutcome || showAbandonOutcome;
  const presentDeps = { ...deps };
  delete presentDeps.removeFloatingPlayerHpPanel;
  return presentAbandonOutcome(presentDeps);
}
