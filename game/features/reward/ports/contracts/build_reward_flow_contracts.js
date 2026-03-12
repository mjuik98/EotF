import { createRewardReturnActions } from '../../../../shared/runtime/reward_return_actions.js';

export function buildRewardFlowContractBuilders(ctx) {
  const { buildBaseDeps, getRefs } = ctx;

  return {
    rewardFlow: () => {
      const refs = getRefs();
      const returnActions = createRewardReturnActions({
        returnFromReward: refs.returnFromReward,
        returnToGame: (fromReward = false) => refs.returnToGame?.(fromReward),
      });
      return {
        ...buildBaseDeps('run'),
        openReward: (mode = false) => refs.showRewardScreen?.(mode),
        showGameplayScreen: () => refs.switchScreen?.('game'),
        ...returnActions,
      };
    },
  };
}
