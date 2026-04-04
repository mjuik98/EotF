import { createRewardNavigationRuntimePorts } from '../ports/create_reward_navigation_runtime_ports.js';

export function createRewardNavigationActions(modules, ports) {
  const runtimePorts = ports.getRewardNavigationRuntimePorts?.()
    || createRewardNavigationRuntimePorts({ modules, ports });

  const returnFromReward = () => {
    runtimePorts.returnFromReward();
  };

  const returnToGame = (fromReward = false) => {
    runtimePorts.returnToGame(fromReward);
  };

  return {
    returnFromReward,
    returnToGame,
    rewardActions: {
      returnFromReward,
      returnToGame,
    },
  };
}
