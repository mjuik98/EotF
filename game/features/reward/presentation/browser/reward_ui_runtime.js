import { createLoadedRewardRuntime } from './reward_runtime_loader.js';

export const REWARD_CLAIM_KEY = 'reward:claim';
export const REWARD_SKIP_KEY = 'reward:skip';

async function withRewardRuntime(deps = {}, callback) {
  const runtime = await createLoadedRewardRuntime(deps);
  return callback(runtime);
}

export function takeRewardBlessingRuntime(blessing, deps = {}) {
  return withRewardRuntime(deps, (runtime) => runtime.takeRewardBlessing(blessing));
}

export function takeRewardCardRuntime(cardId, deps = {}) {
  return withRewardRuntime(deps, (runtime) => runtime.takeRewardCard(cardId));
}

export function takeRewardItemRuntime(itemKey, deps = {}) {
  return withRewardRuntime(deps, (runtime) => runtime.takeRewardItem(itemKey));
}

export function takeRewardUpgradeRuntime(deps = {}) {
  return withRewardRuntime(deps, (runtime) => runtime.takeRewardUpgrade());
}

export function takeRewardRemoveRuntime(deps = {}) {
  return withRewardRuntime(deps, (runtime) => runtime.takeRewardRemove());
}

export function skipRewardRuntime(deps = {}) {
  return withRewardRuntime(deps, (runtime) => runtime.skipReward());
}

export function finishReward(deps = {}) {
  return withRewardRuntime(deps, (runtime) => runtime.finishReward());
}
