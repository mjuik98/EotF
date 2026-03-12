import { createRewardNavigationActions } from './reward_navigation_actions.js';

export function createRewardActions(modules, ports) {
  const navigation = createRewardNavigationActions(modules, ports);
  const getRewardFlow = () => ports.getRewardFlowDeps?.();
  const getRewardDeps = () => ports.getRewardDeps();

  function openReward(mode = false) {
    if (typeof modules.RewardUI?.showRewardScreen === 'function') {
      modules.RewardUI.showRewardScreen(mode, getRewardDeps());
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
      modules.RewardUI?.takeRewardCard?.(cardId, getRewardDeps());
    },

    takeRewardItem(itemKey) {
      modules.RewardUI?.takeRewardItem?.(itemKey, getRewardDeps());
    },

    takeRewardUpgrade() {
      modules.RewardUI?.takeRewardUpgrade?.(getRewardDeps());
    },

    takeRewardRemove() {
      modules.RewardUI?.takeRewardRemove?.(getRewardDeps());
    },

    showSkipConfirm() {
      modules.RewardUI?.showSkipConfirm?.(getRewardDeps());
    },

    hideSkipConfirm() {
      modules.RewardUI?.hideSkipConfirm?.(getRewardDeps());
    },

    skipReward() {
      modules.RewardUI?.skipReward?.(getRewardDeps());
    },

    returnFromReward: navigation.returnFromReward,

    returnToGame: navigation.returnToGame,
  };
}
