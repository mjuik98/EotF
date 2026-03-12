import { clearIdempotencyKey, runIdempotent } from '../../utils/idempotency_utils.js';
import { playAttackSlash } from '../../domain/audio/audio_event_helpers.js';
import {
  lockRewardFlow,
  unlockRewardFlow,
} from '../../shared/state/runtime_flow_controls.js';
import { isRewardFlowLocked } from '../../app/shared/selectors/runtime_state_selectors.js';
import {
  buildRewardDiscardDeps,
  claimReward,
  createRewardReturnActions,
  playRewardClaimFeedback,
  scheduleRewardReturnUseCase,
  startRewardRemoveUseCase,
  takeRewardClaimUseCase,
} from '../../app/reward/use_cases/claim_reward_use_case.js';
import {
  getData,
  getDoc,
  getGS,
} from './reward_ui_helpers.js';
import {
  setRewardPickedState,
} from './reward_ui_render.js';

export const REWARD_CLAIM_KEY = 'reward:claim';
export const REWARD_SKIP_KEY = 'reward:skip';

export function finishReward(deps = {}) {
  scheduleRewardReturnUseCase({
    returnFromReward: createRewardReturnActions(deps).returnFromReward,
  });
}

function runRewardClaimRuntime(config, deps = {}) {
  const returnActions = createRewardReturnActions(deps);
  return takeRewardClaimUseCase({
    claimRewardFn: claimReward,
    data: config.requireData ? getData(deps) : undefined,
    doc: getDoc(deps),
    feedbackDeps: deps,
    gs: getGS(deps),
    isRewardFlowLockedFn: isRewardFlowLocked,
    lockRewardFlowFn: lockRewardFlow,
    markPicked: config.markPicked,
    onFailure: config.onFailure,
    playRewardClaimFeedbackFn: playRewardClaimFeedback,
    requireData: config.requireData,
    rewardId: config.rewardId,
    rewardType: config.rewardType,
    returnFromReward: returnActions.returnFromReward,
    setRewardPickedStateFn: setRewardPickedState,
    showItemToast: deps.showItemToast,
  });
}

export function takeRewardBlessingRuntime(blessing, deps = {}) {
  return runIdempotent(REWARD_CLAIM_KEY, () => runRewardClaimRuntime({
    onFailure: () => playAttackSlash(deps.audioEngine),
    rewardId: blessing,
    rewardType: 'blessing',
  }, deps), { ttlMs: 3000 });
}

export function takeRewardCardRuntime(cardId, deps = {}) {
  return runIdempotent(REWARD_CLAIM_KEY, () => runRewardClaimRuntime({
    requireData: true,
    rewardId: cardId,
    rewardType: 'card',
  }, deps), { ttlMs: 3000 });
}

export function takeRewardItemRuntime(itemKey, deps = {}) {
  return runIdempotent(REWARD_CLAIM_KEY, () => runRewardClaimRuntime({
    requireData: true,
    rewardId: itemKey,
    rewardType: 'item',
  }, deps), { ttlMs: 3000 });
}

export function takeRewardUpgradeRuntime(deps = {}) {
  return runIdempotent(REWARD_CLAIM_KEY, () => runRewardClaimRuntime({
    markPicked: false,
    onFailure: () => playAttackSlash(deps.audioEngine),
    requireData: true,
    rewardType: 'upgrade',
  }, deps), { ttlMs: 3000 });
}

export function takeRewardRemoveRuntime(deps = {}) {
  return runIdempotent(REWARD_CLAIM_KEY, () => {
    return startRewardRemoveUseCase({
      buildRewardDiscardDepsFn: ({ onCancel, returnActions }) => buildRewardDiscardDeps({
        deps,
        onCancel,
        returnActions,
      }),
      clearIdempotencyKeyFn: clearIdempotencyKey,
      doc: getDoc(deps),
      eventUI: deps.EventUI,
      gs: getGS(deps),
      isRewardFlowLockedFn: isRewardFlowLocked,
      lockRewardFlowFn: lockRewardFlow,
      rewardClaimKey: REWARD_CLAIM_KEY,
      returnActions: createRewardReturnActions(deps),
      setRewardPickedStateFn: setRewardPickedState,
      unlockRewardFlowFn: unlockRewardFlow,
    });
  }, { ttlMs: 3000 });
}

export function skipRewardRuntime(deps = {}) {
  const gs = getGS(deps);
  if (!gs) return;

  return runIdempotent(REWARD_SKIP_KEY, () => {
    if (isRewardFlowLocked(gs)) return;
    lockRewardFlow(gs);
    createRewardReturnActions(deps).returnFromReward();
  }, { ttlMs: 3000 });
}
