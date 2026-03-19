import { createRewardNavigationActions } from './reward_navigation_actions.js';

export function createRewardActions(modules, ports) {
  const navigation = createRewardNavigationActions(modules, ports);
  const getRewardFlow = () => ports.getRewardFlowDeps?.();
  const getRewardDeps = () => ports.getRewardDeps();
  const callRewardAction = (actionName, ...args) => {
    const rewardDeps = getRewardDeps();
    const rewardAction = rewardDeps?.[actionName];
    if (typeof rewardAction === 'function') {
      rewardAction(...args);
      return true;
    }

    const compatAction = modules.RewardUI?.[actionName];
    if (typeof compatAction === 'function') {
      compatAction(...args, rewardDeps);
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
