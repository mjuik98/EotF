import { createRewardRuntime } from '../../application/create_reward_runtime.js';
import {
  REWARD_CLAIM_KEY,
  REWARD_SKIP_KEY,
} from '../../application/reward_runtime_actions.js';

export { REWARD_CLAIM_KEY, REWARD_SKIP_KEY };

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
