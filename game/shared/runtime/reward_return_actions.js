export function createRewardReturnActions(deps = {}) {
  const returnFromReward = () => {
    if (typeof deps.rewardActions?.returnFromReward === 'function') {
      deps.rewardActions.returnFromReward();
      return;
    }
    if (typeof deps.returnFromReward === 'function') {
      deps.returnFromReward();
      return;
    }
    deps.returnToGame?.(true);
  };

  const returnToGame = (fromReward = false) => {
    if (fromReward) {
      returnFromReward();
      return;
    }
    if (typeof deps.rewardActions?.returnToGame === 'function') {
      deps.rewardActions.returnToGame(false);
      return;
    }
    deps.returnToGame?.(false);
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
