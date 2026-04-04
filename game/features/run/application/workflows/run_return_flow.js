import { resolveBranchTargetRegion } from '../../ports/public_run_return_presentation_capabilities.js';
import { getRunSetTimeout } from '../../ports/run_runtime_timing_ports.js';
import {
  clearRunReturnCombatSurface,
  dismissRunReturnNodeOverlay,
  getRunReturnDoc,
  prepareRewardExitPresentation,
  scheduleRunReturnRefresh,
  showGameplayScreenFromReturn,
} from '../../ports/public_run_return_presentation_capabilities.js';
import {
  consumeBossRewardFlags,
  resetRuntimeInteractionState,
} from '../../ports/public_state_capabilities.js';

function finalizeBossVictoryOutcome(deps, gs) {
  deps.finalizeRunOutcome?.('victory', {
    echoFragments: 5,
    bossCleared: true,
  }, { gs });
  if (deps.storySystem?.checkHiddenEnding?.()) deps.storySystem.showHiddenEnding();
  else deps.storySystem?.showNormalEnding?.();
}

function getRunReturnSchedule(deps = {}) {
  return getRunSetTimeout(deps);
}

function scheduleBossRegionTransition(deps, gs, clearRewardExitStyles, rewardExitDelay) {
  getRunReturnSchedule(deps)(() => {
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
  const schedule = getRunReturnSchedule(deps);
  schedule(() => {
    showGameplayScreenFromReturn(deps);
    clearRewardExitStyles();
    scheduleRunReturnRefresh(deps, 50, () => {
      if (typeof deps.renderMinimap === 'function') {
        schedule(() => deps.renderMinimap(), 50);
      }
    });
  }, rewardExitDelay);
}

export function returnToGameplayFromRun(fromReward, deps = {}) {
  const gs = deps.gs;
  const runRules = deps.runRules;
  if (!gs || !runRules) {
    deps.logger?.error?.('[RunReturnUI] Missing gs or runRules');
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
      getRunReturnSchedule(deps)(() => {
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
