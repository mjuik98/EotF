import {
  finishRewardFlow,
  REWARD_CLAIM_KEY,
  REWARD_SKIP_KEY,
  skipRewardAction,
  takeRewardBlessingAction,
  takeRewardCardAction,
  takeRewardItemAction,
  takeRewardRemoveAction,
  takeRewardUpgradeAction,
} from '../../features/reward/public.js';
import {
  getData,
  getDoc,
  getGS,
} from './reward_ui_helpers.js';
import {
  setRewardPickedState,
} from './reward_ui_render.js';

export function finishReward(deps = {}) {
  return finishRewardFlow(deps);
}

const rewardRuntime = {
  getData,
  getDoc,
  getGS,
  setRewardPickedStateFn: setRewardPickedState,
};

export function takeRewardBlessingRuntime(blessing, deps = {}) {
  return takeRewardBlessingAction(blessing, deps, rewardRuntime);
}

export function takeRewardCardRuntime(cardId, deps = {}) {
  return takeRewardCardAction(cardId, deps, rewardRuntime);
}

export function takeRewardItemRuntime(itemKey, deps = {}) {
  return takeRewardItemAction(itemKey, deps, rewardRuntime);
}

export function takeRewardUpgradeRuntime(deps = {}) {
  return takeRewardUpgradeAction(deps, rewardRuntime);
}

export function takeRewardRemoveRuntime(deps = {}) {
  return takeRewardRemoveAction(deps, rewardRuntime);
}

export function skipRewardRuntime(deps = {}) {
  return skipRewardAction(deps, rewardRuntime);
}
