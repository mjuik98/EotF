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

function cleanupCombatAfterAbandonFallback(deps = {}) {
  const { gs, doc } = deps;
  if (!gs?.combat?.active) return false;

  gs.triggerItems?.('combat_end', { isBoss: false, defeated: true, abandoned: true });
  if (typeof deps.applyCombatEndCleanupState === 'function') {
    deps.applyCombatEndCleanupState(gs);
  } else {
    deps.deactivateCombat?.(gs);
  }
  const hudUpdateUI = deps.hudUpdateUI || null;
  if (typeof hudUpdateUI?.resetCombatUI === 'function') {
    hudUpdateUI.resetCombatUI({ ...deps, doc, gs });
  } else {
    doc?.getElementById?.('combatOverlay')?.classList?.remove?.('active');
  }

  return true;
}

function resolveCombatCleanup(deps = {}) {
  if (typeof deps.cleanupCombatAfterAbandon === 'function') {
    return deps.cleanupCombatAfterAbandon;
  }
  return cleanupCombatAfterAbandonFallback;
}

export function confirmHelpPauseAbandonRun(deps = {}, onClosePauseMenu = () => {}) {
  const gs = resolveGs(deps);
  if (!gs) return false;

  const doc = resolveDoc(deps);
  doc?.getElementById?.('abandonConfirm')?.remove();
  onClosePauseMenu(doc);

  resolveCombatCleanup(deps)({ ...deps, doc, gs });
  deps.removeFloatingPlayerHpPanel?.({ doc });

  if (typeof deps.finalizeRunOutcome === 'function') {
    deps.finalizeRunOutcome('defeat', { echoFragments: 2, abandoned: true }, { gs });
  }

  clearActiveRunSave(deps);
  const presentAbandonOutcome = deps.showAbandonOutcome || null;
  const presentDeps = { ...deps };
  delete presentDeps.cleanupCombatAfterAbandon;
  delete presentDeps.deactivateCombat;
  delete presentDeps.removeFloatingPlayerHpPanel;
  delete presentDeps.showAbandonOutcome;
  return presentAbandonOutcome?.(presentDeps) ?? false;
}
