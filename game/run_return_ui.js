'use strict';

(function initRunReturnUI(globalObj) {
  function _getDoc(deps) {
    return deps?.doc || document;
  }

  const RunReturnUI = {
    returnToGame(fromReward, deps = {}) {
      const gs = deps.gs;
      const runRules = deps.runRules || globalObj.RunRules;
      if (!gs || !runRules) return;

      const wasBoss = gs._bossRewardPending;
      const wasLastRegion = gs._bossLastRegion;
      const endlessRun = runRules.isEndless(gs);

      gs._bossRewardPending = false;
      gs._bossLastRegion = false;
      gs._rewardLock = false;
      gs._nodeMoveLock = false;
      gs._eventLock = false;

      const doc = _getDoc(deps);
      doc.getElementById('combatOverlay')?.classList.remove('active');
      const combatHand = doc.getElementById('combatHandCards');
      if (combatHand) combatHand.innerHTML = '';
      const enemyZone = doc.getElementById('enemyZone');
      if (enemyZone) enemyZone.innerHTML = '';

      if (fromReward && wasBoss) {
        if (wasLastRegion) {
          if (!endlessRun) {
            if (typeof deps.finalizeRunOutcome === 'function') {
              deps.finalizeRunOutcome('victory', { echoFragments: 5 });
            }
            doc.getElementById('rewardScreen')?.classList.remove('active');
            if (deps.storySystem?.checkHiddenEnding?.()) deps.storySystem.showHiddenEnding();
            else deps.storySystem?.showNormalEnding?.();
            return;
          }

          if (typeof deps.switchScreen === 'function') deps.switchScreen('game');
          if (typeof deps.updateUI === 'function') deps.updateUI();
          setTimeout(() => {
            if (typeof deps.advanceToNextRegion === 'function') deps.advanceToNextRegion();
          }, 300);
          return;
        }

        if (typeof deps.switchScreen === 'function') deps.switchScreen('game');
        if (typeof deps.updateUI === 'function') deps.updateUI();
        setTimeout(() => {
          if (typeof deps.advanceToNextRegion === 'function') deps.advanceToNextRegion();
        }, 300);
        return;
      }

      if (typeof deps.switchScreen === 'function') deps.switchScreen('game');
      if (typeof deps.updateUI === 'function') deps.updateUI();
      if (typeof deps.renderMapOverlay === 'function') deps.renderMapOverlay();
      if (typeof deps.updateNextNodes === 'function') deps.updateNextNodes();
    },
  };

  globalObj.RunReturnUI = RunReturnUI;
})(window);
