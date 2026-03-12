import { clearIdempotencyKey, runIdempotent } from '../../../utils/idempotency_utils.js';
import { playAttackSlash } from '../platform/reward_audio_ports.js';
import {
  isRewardFlowLocked,
  lockRewardFlow,
  unlockRewardFlow,
} from '../state/reward_runtime_flow_ports.js';
import { createRewardReturnActions } from '../platform/reward_return_ports.js';
import {
  buildRewardDiscardDeps,
  claimReward,
  playRewardClaimFeedback,
  scheduleRewardReturnUseCase,
  startRewardRemoveUseCase,
  takeRewardClaimUseCase,
} from './claim_reward_use_case.js';

export const REWARD_CLAIM_KEY = 'reward:claim';
export const REWARD_SKIP_KEY = 'reward:skip';

export function finishRewardFlow(deps = {}) {
  scheduleRewardReturnUseCase({
    returnFromReward: createRewardReturnActions(deps).returnFromReward,
  });
}

function runRewardClaimRuntime(config, deps = {}, runtime = {}) {
  const returnActions = createRewardReturnActions(deps);
  return takeRewardClaimUseCase({
    claimRewardFn: claimReward,
    data: config.requireData ? runtime.getData?.(deps) : undefined,
    feedbackDeps: deps,
    gs: runtime.getGS?.(deps),
    isRewardFlowLockedFn: isRewardFlowLocked,
    lockRewardFlowFn: lockRewardFlow,
    markPicked: config.markPicked,
    onFailure: config.onFailure,
    playRewardClaimFeedbackFn: playRewardClaimFeedback,
    requireData: config.requireData,
    rewardId: config.rewardId,
    rewardType: config.rewardType,
    returnFromReward: returnActions.returnFromReward,
    setRewardPickedState: (picked) => runtime.setRewardPickedState?.(deps, picked),
    showItemToast: deps.showItemToast,
  });
}

export function takeRewardBlessingAction(blessing, deps = {}, runtime = {}) {
  return runIdempotent(REWARD_CLAIM_KEY, () => runRewardClaimRuntime({
    onFailure: () => playAttackSlash(deps.audioEngine),
    rewardId: blessing,
    rewardType: 'blessing',
  }, deps, runtime), { ttlMs: 3000 });
}

export function takeRewardCardAction(cardId, deps = {}, runtime = {}) {
  return runIdempotent(REWARD_CLAIM_KEY, () => runRewardClaimRuntime({
    requireData: true,
    rewardId: cardId,
    rewardType: 'card',
  }, deps, runtime), { ttlMs: 3000 });
}

export function takeRewardItemAction(itemKey, deps = {}, runtime = {}) {
  return runIdempotent(REWARD_CLAIM_KEY, () => runRewardClaimRuntime({
    requireData: true,
    rewardId: itemKey,
    rewardType: 'item',
  }, deps, runtime), { ttlMs: 3000 });
}

export function takeRewardUpgradeAction(deps = {}, runtime = {}) {
  return runIdempotent(REWARD_CLAIM_KEY, () => runRewardClaimRuntime({
    markPicked: false,
    onFailure: () => playAttackSlash(deps.audioEngine),
    requireData: true,
    rewardType: 'upgrade',
  }, deps, runtime), { ttlMs: 3000 });
}

export function takeRewardRemoveAction(deps = {}, runtime = {}) {
  return runIdempotent(REWARD_CLAIM_KEY, () => {
    return startRewardRemoveUseCase({
      buildRewardDiscardDepsFn: ({ onCancel, returnActions }) => buildRewardDiscardDeps({
        deps,
        onCancel,
        returnActions,
      }),
      clearIdempotencyKeyFn: clearIdempotencyKey,
      gs: runtime.getGS?.(deps),
      isRewardFlowLockedFn: isRewardFlowLocked,
      lockRewardFlowFn: lockRewardFlow,
      openRewardRemoveDiscard: ({ gs, isBurn, deps: discardDeps }) => {
        return runtime.openRewardRemoveDiscard?.(deps, {
          gs,
          isBurn,
          payload: discardDeps,
        });
      },
      rewardClaimKey: REWARD_CLAIM_KEY,
      returnActions: createRewardReturnActions(deps),
      setRewardPickedState: (picked) => runtime.setRewardPickedState?.(deps, picked),
      unlockRewardFlowFn: unlockRewardFlow,
    });
  }, { ttlMs: 3000 });
}

export function skipRewardAction(deps = {}, runtime = {}) {
  const gs = runtime.getGS?.(deps);
  if (!gs) return;

  return runIdempotent(REWARD_SKIP_KEY, () => {
    if (isRewardFlowLocked(gs)) return;
    lockRewardFlow(gs);
    createRewardReturnActions(deps).returnFromReward();
  }, { ttlMs: 3000 });
}
