export function buildRewardFlowContractBuilders(ctx) {
  const { buildBaseDeps, getRefs } = ctx;

  return {
    rewardFlow: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('run'),
        openReward: (mode = false) => refs.showRewardScreen?.(mode),
      };
    },
  };
}
