let rewardRuntimeFactoryPromise = null;

export async function loadCreateRewardRuntime() {
  if (!rewardRuntimeFactoryPromise) {
    rewardRuntimeFactoryPromise = import('../../application/create_reward_runtime.js')
      .then((mod) => mod.createRewardRuntime)
      .catch((error) => {
        rewardRuntimeFactoryPromise = null;
        throw error;
      });
  }

  return rewardRuntimeFactoryPromise;
}

export async function createLoadedRewardRuntime(deps = {}) {
  const createRewardRuntime = await loadCreateRewardRuntime();
  return createRewardRuntime(deps);
}
