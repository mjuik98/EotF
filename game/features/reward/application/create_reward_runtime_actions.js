import { createRewardNavigationActions } from './reward_navigation_actions.js';

export function createRewardActions(modules, ports) {
  const navigation = createRewardNavigationActions(modules, ports);
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
    showRewardScreen(isBoss) {
      openReward(isBoss);
    },

    openReward(mode = false) {
      openReward(mode);
    },

    takeRewardCard(cardId) {
      callRewardAction('takeRewardCard', cardId);
    },

    takeRewardItem(itemKey) {
      callRewardAction('takeRewardItem', itemKey);
    },

    takeRewardUpgrade() {
      callRewardAction('takeRewardUpgrade');
    },

    takeRewardRemove() {
      callRewardAction('takeRewardRemove');
    },

    showSkipConfirm() {
      callRewardAction('showSkipConfirm');
    },

    hideSkipConfirm() {
      callRewardAction('hideSkipConfirm');
    },

    skipReward() {
      callRewardAction('skipReward');
    },

    returnFromReward: navigation.returnFromReward,

    returnToGame: navigation.returnToGame,
  };
}
