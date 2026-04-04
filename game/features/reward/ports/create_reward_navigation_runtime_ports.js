export function createRewardNavigationRuntimePorts({ modules = {}, ports = {} } = {}) {
  const getRunReturnDeps = () => ports.getRunReturnDeps?.();
  const getRewardFlow = () => ports.getRewardFlowDeps?.();

  return {
    returnFromReward() {
      const deps = getRunReturnDeps();

      if (typeof modules.RunReturnUI?.returnFromReward === 'function') {
        modules.RunReturnUI.returnFromReward(deps);
        return;
      }

      if (typeof modules.RunReturnUI?.returnToGame === 'function') {
        modules.RunReturnUI.returnToGame(true, deps);
        return;
      }

      getRewardFlow()?.returnFromReward?.();
    },

    returnToGame(fromReward = false) {
      const deps = getRunReturnDeps();

      if (typeof modules.RunReturnUI?.returnToGame === 'function') {
        modules.RunReturnUI.returnToGame(fromReward, deps);
        return;
      }

      if (fromReward) {
        getRewardFlow()?.returnFromReward?.();
        return;
      }

      getRewardFlow()?.returnToGame?.(false);
    },
  };
}
