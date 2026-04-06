import {
  createRewardReturnActions,
  playUiItemGetFeedback,
} from '../integration/runtime_feedback_capabilities.js';
import {
  applyMiniBossBonusState,
} from '../state/reward_state_commands.js';
import { claimRewardByType } from './claim_reward_handlers.js';

export { createRewardReturnActions } from '../integration/runtime_feedback_capabilities.js';

export function playRewardClaimFeedback(deps = {}) {
  return playUiItemGetFeedback(deps.playItemGet, deps.audioEngine);
}

export function buildRewardDiscardDeps({ deps = {}, onCancel, returnActions = createRewardReturnActions(deps) } = {}) {
  return {
    ...deps,
    ...returnActions,
    onCancel,
  };
}

export function scheduleRewardReturnUseCase({
  delayMs = 350,
  returnFromReward,
  setTimeoutFn = setTimeout,
} = {}) {
  setTimeoutFn(() => returnFromReward?.(), delayMs);
}

export function ensureMiniBossBonus(gs, data, deps = {}) {
  const result = applyMiniBossBonusState(gs, data);
  if (!result) return null;

  gs.addLog?.(`중간 보스 보상: 골드 +${result.goldGain}, 체력 +${result.healed}`, 'system');
  if (!result.guaranteed) return null;
  playRewardClaimFeedback(deps);
  deps.showItemToast?.(result.guaranteed, { forceQueue: true });
  gs.addLog?.(`중간 보스 유물: ${result.guaranteed.icon || '@'} ${result.guaranteed.name}`, 'system');
  return result.guaranteed;
}

export function claimReward({
  gs,
  data,
  rewardType,
  rewardId,
  context = {},
} = {}) {
  if (!gs) return { success: false };
  return claimRewardByType({ context, data, gs, rewardId, rewardType });
}

export function takeRewardClaimUseCase({
  gs,
  data,
  rewardType,
  rewardId,
  requireData = false,
  markPicked = true,
  onFailure,
  claimRewardFn,
  isRewardFlowLockedFn,
  lockRewardFlowFn,
  setRewardPickedState,
  playRewardClaimFeedbackFn,
  showItemToast,
  scheduleRewardReturnFn = scheduleRewardReturnUseCase,
  returnFromReward,
  feedbackDeps,
} = {}) {
  if (!gs || (requireData && !data)) return { success: false, reason: 'missing-context' };
  if (isRewardFlowLockedFn(gs)) return { success: false, reason: 'locked' };

  const result = claimRewardFn({
    data,
    gs,
    rewardId,
    rewardType,
  });

  if (!result?.success) {
    onFailure?.(result);
    return result || { success: false };
  }

  lockRewardFlowFn(gs);
  if (markPicked) {
    setRewardPickedState?.(true);
  }
  playRewardClaimFeedbackFn(feedbackDeps);
  showItemToast?.(result.notification?.payload, result.notification?.options);
  scheduleRewardReturnFn({ returnFromReward });
  return result;
}

export function createRewardRemoveCancelAction({
  gs,
  rewardClaimKey,
  clearIdempotencyKeyFn,
  unlockRewardFlowFn,
  setRewardPickedState,
} = {}) {
  return () => {
    unlockRewardFlowFn(gs);
    clearIdempotencyKeyFn(rewardClaimKey);
    setRewardPickedState?.(false);
  };
}

export function startRewardRemoveUseCase({
  gs,
  rewardClaimKey,
  isRewardFlowLockedFn,
  lockRewardFlowFn,
  unlockRewardFlowFn,
  setRewardPickedState,
  clearIdempotencyKeyFn,
  returnActions,
  buildRewardDiscardDepsFn,
  openRewardRemoveDiscard,
  createCancelActionFn = createRewardRemoveCancelAction,
} = {}) {
  if (!gs) return { started: false, reason: 'missing-state' };
  if (isRewardFlowLockedFn(gs)) return { started: false, reason: 'locked' };

  lockRewardFlowFn(gs);
  setRewardPickedState?.(true);

  const onCancel = createCancelActionFn({
    clearIdempotencyKeyFn,
    gs,
    rewardClaimKey,
    setRewardPickedState,
    unlockRewardFlowFn,
  });

  if (openRewardRemoveDiscard?.({
    deps: buildRewardDiscardDepsFn({ onCancel, returnActions }),
    gs,
    isBurn: true,
  })) {
    return { started: true, mode: 'discard' };
  }

  returnActions.returnFromReward();
  return { started: true, mode: 'return' };
}
