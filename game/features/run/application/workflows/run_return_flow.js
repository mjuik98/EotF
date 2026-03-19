import { resolveBranchTargetRegion } from '../../presentation/browser/run_return_branch_presenter.js';
import {
  clearRunReturnCombatSurface,
  dismissRunReturnNodeOverlay,
  getRunReturnDoc,
  prepareRewardExitPresentation,
  scheduleRunReturnRefresh,
  showGameplayScreenFromReturn,
} from '../../presentation/browser/run_return_overlay_presenter.js';
import {
  consumeBossRewardFlags,
  resetRuntimeInteractionState,
} from '../../../../shared/state/runtime_flow_controls.js';

function finalizeBossVictoryOutcome(deps, gs) {
  deps.finalizeRunOutcome?.('victory', {
    echoFragments: 5,
    bossCleared: true,
  }, { gs });
  if (deps.storySystem?.checkHiddenEnding?.()) deps.storySystem.showHiddenEnding();
  else deps.storySystem?.showNormalEnding?.();
}

function scheduleBossRegionTransition(deps, gs, clearRewardExitStyles, rewardExitDelay) {
  setTimeout(() => {
    showGameplayScreenFromReturn(deps);
    clearRewardExitStyles();
    scheduleRunReturnRefresh(deps, 100, () => {
      void (async () => {
        const targetRegionId = await resolveBranchTargetRegion(gs, deps);
        deps.advanceToNextRegion?.({ ...deps, targetRegionId });
      })();
    });
  }, rewardExitDelay);
}

function scheduleStandardGameplayReturn(deps, clearRewardExitStyles, rewardExitDelay) {
  setTimeout(() => {
    showGameplayScreenFromReturn(deps);
    clearRewardExitStyles();
    scheduleRunReturnRefresh(deps, 50, () => {
      if (typeof deps.renderMinimap === 'function') {
        setTimeout(() => deps.renderMinimap(), 50);
      }
    });
  }, rewardExitDelay);
}

export function returnToGameplayFromRun(fromReward, deps = {}) {
  const gs = deps.gs;
  const runRules = deps.runRules;
  if (!gs || !runRules) {
    console.error('[RunReturnUI] Missing gs or runRules');
    return;
  }

  const bossRewardState = consumeBossRewardFlags(gs);
  const wasBoss = bossRewardState.pending;
  const wasLastRegion = bossRewardState.lastRegion;
  const endlessRun = runRules.isEndless(gs);
  resetRuntimeInteractionState(gs);

  const doc = getRunReturnDoc(deps);
  clearRunReturnCombatSurface(doc);
  dismissRunReturnNodeOverlay(doc.getElementById('nodeCardOverlay'), fromReward);

  const {
    rewardExitDelay,
    rewardScreen,
    clearRewardExitStyles,
  } = prepareRewardExitPresentation(doc, fromReward);

  if (fromReward && wasBoss) {
    if (wasLastRegion && !endlessRun) {
      setTimeout(() => {
        rewardScreen?.classList.remove('active');
        clearRewardExitStyles();
        finalizeBossVictoryOutcome(deps, gs);
      }, rewardExitDelay);
      return;
    }

    scheduleBossRegionTransition(deps, gs, clearRewardExitStyles, rewardExitDelay);
    return;
  }

  scheduleStandardGameplayReturn(deps, clearRewardExitStyles, rewardExitDelay);
}
