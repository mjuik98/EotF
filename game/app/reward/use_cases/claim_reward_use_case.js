import { playUiItemGetFeedback } from '../../../domain/audio/audio_event_helpers.js';
import {
  addRewardCardToDeck,
  addRewardItemToInventory,
  applyBlessingRewardState,
  applyMiniBossBonusState,
  upgradeRandomRewardCardState,
} from '../../../features/reward/state/reward_state_commands.js';
import { getRewardMaxEnergyCap } from './build_reward_options_use_case.js';

export function playRewardClaimFeedback(deps = {}) {
  return playUiItemGetFeedback(deps.playItemGet, deps.audioEngine);
}

export function createRewardReturnActions(deps = {}) {
  const returnFromReward = () => {
    if (typeof deps.rewardActions?.returnFromReward === 'function') {
      deps.rewardActions.returnFromReward();
      return;
    }
    if (typeof deps.returnFromReward === 'function') {
      deps.returnFromReward();
      return;
    }
    deps.returnToGame?.(true);
  };

  const returnToGame = (fromReward = false) => {
    if (fromReward) {
      returnFromReward();
      return;
    }
    if (typeof deps.rewardActions?.returnToGame === 'function') {
      deps.rewardActions.returnToGame(false);
      return;
    }
    deps.returnToGame?.(false);
  };

  return {
    returnFromReward,
    returnToGame,
    rewardActions: {
      returnFromReward,
      returnToGame,
    },
  };
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

  gs.addLog?.(`Mini-boss reward: +${result.goldGain} gold, +${result.healed} HP`, 'system');
  if (!result.guaranteed) return null;
  playRewardClaimFeedback(deps);
  deps.showItemToast?.(result.guaranteed, { forceQueue: true });
  gs.addLog?.(`Mini-boss relic: ${result.guaranteed.icon || '@'} ${result.guaranteed.name}`, 'system');
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

  if (rewardType === 'blessing') {
    const blessing = rewardId;
    if (blessing?.type === 'energy' && (gs.player.maxEnergy || 0) >= getRewardMaxEnergyCap(gs)) {
      return { success: false, reason: 'max-energy' };
    }

    applyBlessingRewardState(gs, blessing);

    return {
      success: true,
      notification: { payload: { name: blessing.name, icon: blessing.icon, desc: blessing.desc } },
      updatedState: gs,
    };
  }

  if (rewardType === 'card') {
    addRewardCardToDeck(gs, rewardId);
    const card = data?.cards?.[rewardId];
    return {
      success: true,
      notification: { payload: { name: card?.name || rewardId, icon: card?.icon || '*', desc: card?.desc || '' } },
      updatedState: gs,
    };
  }

  if (rewardType === 'item') {
    const item = data?.items?.[rewardId];
    addRewardItemToInventory(gs, rewardId, item);
    return {
      success: true,
      notification: { payload: item, options: { forceQueue: true } },
      updatedState: gs,
    };
  }

  if (rewardType === 'upgrade') {
    const upgradable = (gs.player.deck || []).filter((id) => data?.upgradeMap?.[id]);
    if (!upgradable.length) {
      return { success: false, reason: 'no-upgrade-target' };
    }

    const upgradedId = upgradeRandomRewardCardState(gs, data);
    if (!upgradedId) {
      return { success: false, reason: 'no-upgrade-target' };
    }

    return {
      success: true,
      notification: {
        payload: {
          name: `Upgrade complete: ${data.cards?.[upgradedId]?.name || upgradedId}`,
          icon: 'UP',
          desc: 'A random card has been upgraded.',
        },
      },
      updatedState: gs,
      rewardId: upgradedId,
    };
  }

  return { success: false, reason: 'unsupported-reward', context };
}

export function takeRewardClaimUseCase({
  gs,
  data,
  doc,
  rewardType,
  rewardId,
  requireData = false,
  markPicked = true,
  onFailure,
  claimRewardFn,
  isRewardFlowLockedFn,
  lockRewardFlowFn,
  setRewardPickedStateFn,
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
    setRewardPickedStateFn(doc, true);
  }
  playRewardClaimFeedbackFn(feedbackDeps);
  showItemToast?.(result.notification?.payload, result.notification?.options);
  scheduleRewardReturnFn({ returnFromReward });
  return result;
}

export function createRewardRemoveCancelAction({
  gs,
  doc,
  rewardClaimKey,
  clearIdempotencyKeyFn,
  unlockRewardFlowFn,
  setRewardPickedStateFn,
} = {}) {
  return () => {
    unlockRewardFlowFn(gs);
    clearIdempotencyKeyFn(rewardClaimKey);
    setRewardPickedStateFn(doc, false);
  };
}

export function startRewardRemoveUseCase({
  gs,
  doc,
  eventUI,
  rewardClaimKey,
  isRewardFlowLockedFn,
  lockRewardFlowFn,
  unlockRewardFlowFn,
  setRewardPickedStateFn,
  clearIdempotencyKeyFn,
  returnActions,
  buildRewardDiscardDepsFn,
  createCancelActionFn = createRewardRemoveCancelAction,
} = {}) {
  if (!gs) return { started: false, reason: 'missing-state' };
  if (isRewardFlowLockedFn(gs)) return { started: false, reason: 'locked' };

  lockRewardFlowFn(gs);
  setRewardPickedStateFn(doc, true);

  if (typeof eventUI?.showCardDiscard === 'function') {
    const onCancel = createCancelActionFn({
      clearIdempotencyKeyFn,
      doc,
      gs,
      rewardClaimKey,
      setRewardPickedStateFn,
      unlockRewardFlowFn,
    });
    eventUI.showCardDiscard(gs, true, buildRewardDiscardDepsFn({ onCancel, returnActions }));
    return { started: true, mode: 'discard' };
  }

  returnActions.returnFromReward();
  return { started: true, mode: 'return' };
}
