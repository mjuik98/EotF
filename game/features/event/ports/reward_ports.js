export function createRewardPorts(depsFactory) {
  return {
    getRewardDeps: () => depsFactory.getRewardDeps(),
    getRewardFlowDeps: () => (
      Object.prototype.hasOwnProperty.call(depsFactory, 'getRewardFlowDeps')
      && typeof depsFactory.getRewardFlowDeps === 'function'
        ? depsFactory.getRewardFlowDeps()
        : undefined
    ),
    getRunReturnDeps: () => depsFactory.getRunReturnDeps(),
  };
}
