import { clearIdempotencyKey, runIdempotent } from '../../utils/idempotency_utils.js';
import { playAttackSlash } from '../../domain/audio/audio_event_helpers.js';
import {
  lockRewardFlow,
  unlockRewardFlow,
} from '../../app/shared/use_cases/runtime_state_use_case.js';
import { isRewardFlowLocked } from '../../app/shared/selectors/runtime_state_selectors.js';
import {
  claimReward,
  playRewardClaimFeedback,
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
  setTimeout(() => deps.returnToGame?.(true), 350);
}

function playRewardItemGet(deps = {}) {
  return playRewardClaimFeedback(deps);
}

export function takeRewardBlessingRuntime(blessing, deps = {}) {
  const gs = getGS(deps);
  if (!gs) return;

  return runIdempotent(REWARD_CLAIM_KEY, () => {
    if (isRewardFlowLocked(gs)) return;
    const result = claimReward({
      gs,
      rewardType: 'blessing',
      rewardId: blessing,
    });
    if (!result?.success) {
      playAttackSlash(deps.audioEngine);
      return;
    }

    lockRewardFlow(gs);
    setRewardPickedState(getDoc(deps), true);

    playRewardItemGet(deps);
    deps.showItemToast?.(result.notification?.payload, result.notification?.options);
    finishReward(deps);
  }, { ttlMs: 3000 });
}

export function takeRewardCardRuntime(cardId, deps = {}) {
  const gs = getGS(deps);
  const data = getData(deps);
  if (!gs || !data) return;

  return runIdempotent(REWARD_CLAIM_KEY, () => {
    if (isRewardFlowLocked(gs)) return;
    const result = claimReward({
      data,
      gs,
      rewardId: cardId,
      rewardType: 'card',
    });
    if (!result?.success) return;

    lockRewardFlow(gs);
    setRewardPickedState(getDoc(deps), true);

    playRewardItemGet(deps);
    deps.showItemToast?.(result.notification?.payload, result.notification?.options);
    finishReward(deps);
  }, { ttlMs: 3000 });
}

export function takeRewardItemRuntime(itemKey, deps = {}) {
  const gs = getGS(deps);
  const data = getData(deps);
  if (!gs || !data) return;

  return runIdempotent(REWARD_CLAIM_KEY, () => {
    if (isRewardFlowLocked(gs)) return;
    const result = claimReward({
      data,
      gs,
      rewardId: itemKey,
      rewardType: 'item',
    });
    if (!result?.success) return;

    lockRewardFlow(gs);
    setRewardPickedState(getDoc(deps), true);

    playRewardItemGet(deps);
    deps.showItemToast?.(result.notification?.payload, result.notification?.options);
    finishReward(deps);
  }, { ttlMs: 3000 });
}

export function takeRewardUpgradeRuntime(deps = {}) {
  const gs = getGS(deps);
  const data = getData(deps);
  if (!gs || !data) return;

  return runIdempotent(REWARD_CLAIM_KEY, () => {
    if (isRewardFlowLocked(gs)) return;
    const result = claimReward({
      data,
      gs,
      rewardType: 'upgrade',
    });
    if (!result?.success) {
      playAttackSlash(deps.audioEngine);
      return;
    }

    lockRewardFlow(gs);
    playRewardItemGet(deps);
    deps.showItemToast?.(result.notification?.payload, result.notification?.options);
    finishReward(deps);
  }, { ttlMs: 3000 });
}

export function takeRewardRemoveRuntime(deps = {}) {
  const gs = getGS(deps);
  if (!gs) return;

  return runIdempotent(REWARD_CLAIM_KEY, () => {
    if (isRewardFlowLocked(gs)) return;
    lockRewardFlow(gs);

    const doc = getDoc(deps);
    setRewardPickedState(doc, true);
    const eventUI = deps.EventUI;

    if (eventUI && typeof eventUI.showCardDiscard === 'function') {
      eventUI.showCardDiscard(gs, true, {
        ...deps,
        onCancel: () => {
          unlockRewardFlow(gs);
          clearIdempotencyKey(REWARD_CLAIM_KEY);
          setRewardPickedState(doc, false);
        },
        returnToGame: (force) => deps.returnToGame?.(force),
      });
      return;
    }

    deps.returnToGame?.(true);
  }, { ttlMs: 3000 });
}

export function skipRewardRuntime(deps = {}) {
  const gs = getGS(deps);
  if (!gs) return;

  return runIdempotent(REWARD_SKIP_KEY, () => {
    if (isRewardFlowLocked(gs)) return;
    lockRewardFlow(gs);
    deps.returnToGame?.(true);
  }, { ttlMs: 3000 });
}
