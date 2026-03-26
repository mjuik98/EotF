import { createRewardReturnActions } from '../../../ui/ports/public_shared_support_capabilities.js';

export function buildRewardFlowContractBuilders(ctx) {
  const { buildBaseDeps, getRefs } = ctx;

  return {
    rewardFlow: () => {
      const refs = getRefs();
      const rewardRefs = refs.featureRefs?.reward || {};
      const screenRefs = refs.featureRefs?.screen || {};
      const showRewardScreenAction = rewardRefs.showRewardScreen || refs.showRewardScreen;
      const switchScreenAction = screenRefs.switchScreen || refs.switchScreen;
      const returnActions = createRewardReturnActions({
        returnFromReward: refs.returnFromReward,
        returnToGame: (fromReward = false) => refs.returnToGame?.(fromReward),
      });
      return {
        ...buildBaseDeps('run'),
        openReward: (mode = false) => {
          if (typeof showRewardScreenAction === 'function') {
            return showRewardScreenAction(mode);
          }
          return switchScreenAction?.('reward');
        },
        showGameplayScreen: () => switchScreenAction?.('game'),
        ...returnActions,
      };
    },
  };
}
