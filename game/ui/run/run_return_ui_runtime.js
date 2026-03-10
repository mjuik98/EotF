import { resolveBranchTargetRegion } from './run_return_ui_branch_ui.js';

export const OVERLAY_DISMISS_MS = 320;

function getRunReturnDoc(deps) {
  return deps?.doc || document;
}

function nextFrame(cb) {
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(cb);
    return;
  }
  setTimeout(cb, 16);
}

function dismissOverlayWithBlur(overlay) {
  if (!overlay) return;
  if (overlay.dataset.dismissing === '1') return;
  overlay.dataset.dismissing = '1';
  overlay.style.opacity = '1';
  overlay.style.filter = 'blur(0)';
  overlay.style.transform = 'translateY(0) scale(1)';
  overlay.style.transition = 'opacity 0.32s ease, filter 0.32s ease, transform 0.32s ease';
  overlay.style.pointerEvents = 'none';
  nextFrame(() => {
    overlay.style.opacity = '0';
    overlay.style.filter = 'blur(12px)';
    overlay.style.transform = 'translateY(10px) scale(0.985)';
  });
  setTimeout(() => {
    overlay.removeAttribute('data-dismissing');
    overlay.style.display = 'none';
    overlay.style.pointerEvents = 'none';
    overlay.style.opacity = '';
    overlay.style.filter = '';
    overlay.style.transform = '';
    overlay.style.transition = '';
  }, OVERLAY_DISMISS_MS);
}

function afterScreenTransition(deps, delay, cb) {
  setTimeout(() => {
    deps.updateUI?.();
    deps.updateNextNodes?.();
    cb?.();
  }, delay);
}

export function returnToGameRuntime(fromReward, deps = {}) {
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

  const doc = getRunReturnDoc(deps);
  doc.getElementById('combatOverlay')?.classList.remove('active');
  const combatHand = doc.getElementById('combatHandCards');
  if (combatHand) combatHand.textContent = '';
  const enemyZone = doc.getElementById('enemyZone');
  if (enemyZone) enemyZone.textContent = '';

  const nodeOverlay = doc.getElementById('nodeCardOverlay');
  if (nodeOverlay && fromReward) {
    dismissOverlayWithBlur(nodeOverlay);
  } else if (nodeOverlay) {
    nodeOverlay.style.display = 'none';
    nodeOverlay.style.pointerEvents = 'none';
  }

  const rewardScreen = doc.getElementById('rewardScreen');
  let rewardExitDelay = 0;
  let clearRewardExitStyles = () => {};
  if (fromReward && rewardScreen?.classList.contains('active')) {
    rewardExitDelay = OVERLAY_DISMISS_MS;
    doc.getElementById('gameScreen')?.classList.add('active');
    rewardScreen.style.opacity = '1';
    rewardScreen.style.filter = 'blur(0)';
    rewardScreen.style.transform = 'translateY(0) scale(1)';
    rewardScreen.style.transition = 'opacity 0.32s ease, filter 0.32s ease, transform 0.32s ease';
    rewardScreen.style.pointerEvents = 'none';
    nextFrame(() => {
      rewardScreen.style.opacity = '0';
      rewardScreen.style.filter = 'blur(12px)';
      rewardScreen.style.transform = 'translateY(10px) scale(0.985)';
    });
    clearRewardExitStyles = () => {
      rewardScreen.style.pointerEvents = '';
      rewardScreen.style.opacity = '';
      rewardScreen.style.filter = '';
      rewardScreen.style.transform = '';
      rewardScreen.style.transition = '';
    };
  } else {
    rewardScreen?.classList.remove('active');
  }

  if (fromReward && wasBoss) {
    if (wasLastRegion && !endlessRun) {
      setTimeout(() => {
        rewardScreen?.classList.remove('active');
        clearRewardExitStyles();
        deps.finalizeRunOutcome?.('victory', {
          echoFragments: 5,
          bossCleared: true,
        });
        if (deps.storySystem?.checkHiddenEnding?.()) deps.storySystem.showHiddenEnding();
        else deps.storySystem?.showNormalEnding?.();
      }, rewardExitDelay);
      return;
    }

    setTimeout(() => {
      deps.switchScreen?.('game');
      clearRewardExitStyles();
      afterScreenTransition(deps, 100, () => {
        void (async () => {
          const targetRegionId = await resolveBranchTargetRegion(gs, deps);
          deps.advanceToNextRegion?.({ ...deps, targetRegionId });
        })();
      });
    }, rewardExitDelay);
    return;
  }

  setTimeout(() => {
    deps.switchScreen?.('game');
    clearRewardExitStyles();
    afterScreenTransition(deps, 50, () => {
      if (typeof deps.renderMinimap === 'function') {
        setTimeout(() => deps.renderMinimap(), 50);
      }
    });
  }, rewardExitDelay);
}
