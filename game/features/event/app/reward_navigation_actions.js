function createRunReturnActions(modules, deps) {
  return {
    returnFromReward() {
      if (typeof modules.RunReturnUI?.returnFromReward === 'function') {
        modules.RunReturnUI.returnFromReward(deps);
        return;
      }
      modules.RunReturnUI?.returnToGame?.(true, deps);
    },

    returnToGame(fromReward = false) {
      if (fromReward) {
        this.returnFromReward();
        return;
      }
      modules.RunReturnUI?.returnToGame?.(false, deps);
    },
  };
}

export function createRewardNavigationActions(modules, ports) {
  const deps = ports.getRunReturnDeps();
  const actions = createRunReturnActions(modules, deps);

  return {
    ...actions,
    rewardActions: {
      returnFromReward: () => actions.returnFromReward(),
      returnToGame: (fromReward = false) => actions.returnToGame(fromReward),
    },
  };
}
