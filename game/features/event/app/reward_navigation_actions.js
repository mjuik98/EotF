import { createRewardReturnActions } from '../../../shared/runtime/reward_return_actions.js';

export function createRewardNavigationActions(modules, ports) {
  const deps = ports.getRunReturnDeps?.();
  const rewardFlow = ports.getRewardFlowDeps?.();
  const actions = createRewardReturnActions({
    rewardActions: rewardFlow,
    returnFromReward() {
      if (typeof modules.RunReturnUI?.returnFromReward === 'function') {
        modules.RunReturnUI.returnFromReward(deps);
        return;
      }
      modules.RunReturnUI?.returnToGame?.(true, deps);
    },
    returnToGame(fromReward = false) {
      if (fromReward) {
        modules.RunReturnUI?.returnToGame?.(true, deps);
        return;
      }
      modules.RunReturnUI?.returnToGame?.(false, deps);
    },
  });

  return {
    ...actions,
  };
}
