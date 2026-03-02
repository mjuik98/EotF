function _getDoc(deps) {
  return deps?.doc || document;
}

export const RunReturnUI = {
  returnToGame(fromReward, deps = {}) {
    const gs = deps.gs;
    const runRules = deps.runRules;
    if (!gs || !runRules) {
      console.error('[RunReturnUI] Missing gs or runRules');
      return;
    }

    console.log('[RunReturnUI] returnToGame called - fromReward:', fromReward, 'wasBoss:', gs._bossRewardPending, 'wasLastRegion:', gs._bossLastRegion);

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

    // rewardScreen 비활성화
    doc.getElementById('rewardScreen')?.classList.remove('active');

    if (fromReward && wasBoss) {
      if (wasLastRegion) {
        if (!endlessRun) {
          if (typeof deps.finalizeRunOutcome === 'function') {
            deps.finalizeRunOutcome('victory', { echoFragments: 5 });
          }
          if (deps.storySystem?.checkHiddenEnding?.()) deps.storySystem.showHiddenEnding();
          else deps.storySystem?.showNormalEnding?.();
          return;
        }

        // 무한 모드: 다음 지역로 이동
        console.log('[RunReturnUI] Endless mode - advancing to next region');
        if (typeof deps.switchScreen === 'function') deps.switchScreen('game');
        if (typeof deps.updateUI === 'function') deps.updateUI();
        if (typeof deps.updateNextNodes === 'function') deps.updateNextNodes();
        setTimeout(() => {
          if (typeof deps.advanceToNextRegion === 'function') {
            console.log('[RunReturnUI] Calling advanceToNextRegion');
            deps.advanceToNextRegion();
          } else {
            console.error('[RunReturnUI] advanceToNextRegion not available');
          }
        }, 300);
        return;
      }

      // 보스 처치 후 다음 지역로 이동
      console.log('[RunReturnUI] Boss defeated - advancing to next region');
      if (typeof deps.switchScreen === 'function') deps.switchScreen('game');
      if (typeof deps.updateUI === 'function') deps.updateUI();
      if (typeof deps.updateNextNodes === 'function') deps.updateNextNodes();
      setTimeout(() => {
        if (typeof deps.advanceToNextRegion === 'function') {
          console.log('[RunReturnUI] Calling advanceToNextRegion');
          deps.advanceToNextRegion();
        } else {
          console.error('[RunReturnUI] advanceToNextRegion not available');
        }
      }, 300);
      return;
    }

    // 일반 전투 승리 후 맵 화면으로 복귀
    if (typeof deps.switchScreen === 'function') deps.switchScreen('game');
    if (typeof deps.updateUI === 'function') deps.updateUI();
    if (typeof deps.updateNextNodes === 'function') deps.updateNextNodes();

    // 미니맵 렌더링以确保 노드 선택 가능
    if (typeof deps.renderMinimap === 'function') {
      setTimeout(() => deps.renderMinimap(), 50);
    }
  },
};
