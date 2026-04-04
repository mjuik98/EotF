import { createRewardRuntimeContext as createBrowserRewardRuntimeContext } from '../platform/browser/reward_runtime_context.js';

export function resolveRewardRuntimeContext(deps = {}, runtime = null) {
  if (runtime) return runtime;
  if (deps.rewardRuntimeContext) return deps.rewardRuntimeContext;

  const createRewardRuntimeContext = deps.createRewardRuntimeContext || createBrowserRewardRuntimeContext;
  return createRewardRuntimeContext(deps);
}
