function _getDoc(deps) {
  return deps?.doc || document;
}

function _afterScreenTransition(deps, delay, cb) {
  setTimeout(() => {
    deps.updateUI?.();
    deps.updateNextNodes?.();
    cb?.();
  }, delay);
}

export const RunReturnUI = {
  returnToGame(fromReward, deps = {}) {
    const gs = deps.gs;
    const runRules = deps.runRules;
    if (!gs || !runRules) {
      console.error('[RunReturnUI] Missing gs or runRules');
      return;
    }

    const wasBoss = gs._bossRewardPending;
    const wasLastRegion = gs._bossLastRegion;
    const endlessRun = runRules.isEndless(gs);

    gs._bossRewardPending = false;
    gs._bossLastRegion = false;
    gs._rewardLock = false;
    gs._nodeMoveLock = false;
    gs._eventLock = false;
    gs._endCombatScheduled = false;
    gs._endCombatRunning = false;

    const doc = _getDoc(deps);
    doc.getElementById('combatOverlay')?.classList.remove('active');
    const combatHand = doc.getElementById('combatHandCards');
    if (combatHand) combatHand.textContent = '';
    const enemyZone = doc.getElementById('enemyZone');
    if (enemyZone) enemyZone.textContent = '';
    const nodeOverlay = doc.getElementById('nodeCardOverlay');
    if (nodeOverlay) {
      nodeOverlay.style.display = 'none';
      nodeOverlay.style.pointerEvents = 'none';
    }

    doc.getElementById('rewardScreen')?.classList.remove('active');

    if (fromReward && wasBoss) {
      if (wasLastRegion && !endlessRun) {
        deps.finalizeRunOutcome?.('victory', { echoFragments: 5 });
        if (deps.storySystem?.checkHiddenEnding?.()) deps.storySystem.showHiddenEnding();
        else deps.storySystem?.showNormalEnding?.();
        return;
      }

      deps.switchScreen?.('game');
      _afterScreenTransition(deps, 100, () => {
        deps.advanceToNextRegion?.(deps);
      });
      return;
    }

    deps.switchScreen?.('game');
    _afterScreenTransition(deps, 50, () => {
      if (typeof deps.renderMinimap === 'function') {
        setTimeout(() => deps.renderMinimap(), 50);
      }
    });
  },
};
