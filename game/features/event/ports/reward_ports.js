export function createRewardPorts(depsFactory) {
  return {
    getRewardDeps: () => depsFactory.getRewardDeps(),
    getRunReturnDeps: () => depsFactory.getRunReturnDeps(),
  };
}
