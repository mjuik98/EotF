import {
  createRewardRuntime,
  REWARD_CLAIM_KEY,
  REWARD_SKIP_KEY,
} from '../../features/reward/public.js';

export function takeRewardBlessingRuntime(blessing, deps = {}) {
  return createRewardRuntime(deps).takeRewardBlessing(blessing);
}

export function takeRewardCardRuntime(cardId, deps = {}) {
  return createRewardRuntime(deps).takeRewardCard(cardId);
}

export function takeRewardItemRuntime(itemKey, deps = {}) {
  return createRewardRuntime(deps).takeRewardItem(itemKey);
}

export function takeRewardUpgradeRuntime(deps = {}) {
  return createRewardRuntime(deps).takeRewardUpgrade();
}

export function takeRewardRemoveRuntime(deps = {}) {
  return createRewardRuntime(deps).takeRewardRemove();
}

export function skipRewardRuntime(deps = {}) {
  return createRewardRuntime(deps).skipReward();
}

export function finishReward(deps = {}) {
  return createRewardRuntime(deps).finishReward();
}
