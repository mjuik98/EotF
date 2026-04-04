export function createRewardRuntimeActionPorts(modules, ports) {
  const getRewardFlow = () => ports.getRewardFlowDeps?.();
  const getRewardDeps = () => ports.getRewardDeps();
  const rewardDepsDispatchStack = new Set();

  const callRewardAction = (actionName, ...args) => {
    const canDispatchViaRewardDeps = !rewardDepsDispatchStack.has(actionName);
    const rewardDeps = getRewardDeps();
    const rewardAction = rewardDeps?.[actionName];
    if (canDispatchViaRewardDeps && typeof rewardAction === 'function') {
      rewardDepsDispatchStack.add(actionName);
      try {
        rewardAction(...args);
        return true;
      } finally {
        rewardDepsDispatchStack.delete(actionName);
      }
    }

    const rewardUi = modules.RewardUI;
    const compatAction = rewardUi?.[actionName];
    if (typeof compatAction === 'function') {
      compatAction.call(rewardUi, ...args, rewardDeps);
      return true;
    }

    return false;
  };

  function openReward(mode = false) {
    if (callRewardAction('showRewardScreen', mode)) {
      return;
    }

    getRewardFlow()?.openReward?.(mode);
  }

  return {
    hideSkipConfirm() {
      callRewardAction('hideSkipConfirm');
    },

    openReward,

    showRewardScreen(isBoss) {
      openReward(isBoss);
    },

    showSkipConfirm() {
      callRewardAction('showSkipConfirm');
    },

    skipReward() {
      callRewardAction('skipReward');
    },

    takeRewardCard(cardId) {
      callRewardAction('takeRewardCard', cardId);
    },

    takeRewardItem(itemKey) {
      callRewardAction('takeRewardItem', itemKey);
    },

    takeRewardRemove() {
      callRewardAction('takeRewardRemove');
    },

    takeRewardUpgrade() {
      callRewardAction('takeRewardUpgrade');
    },
  };
}
