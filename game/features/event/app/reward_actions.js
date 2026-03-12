import { createRewardNavigationActions } from './reward_navigation_actions.js';

export function createRewardActions(modules, ports) {
  const navigation = createRewardNavigationActions(modules, ports);

  return {
    showRewardScreen(isBoss) {
      modules.RewardUI?.showRewardScreen?.(isBoss, ports.getRewardDeps());
    },

    takeRewardCard(cardId) {
      modules.RewardUI?.takeRewardCard?.(cardId, ports.getRewardDeps());
    },

    takeRewardItem(itemKey) {
      modules.RewardUI?.takeRewardItem?.(itemKey, ports.getRewardDeps());
    },

    takeRewardUpgrade() {
      modules.RewardUI?.takeRewardUpgrade?.(ports.getRewardDeps());
    },

    takeRewardRemove() {
      modules.RewardUI?.takeRewardRemove?.(ports.getRewardDeps());
    },

    showSkipConfirm() {
      modules.RewardUI?.showSkipConfirm?.(ports.getRewardDeps());
    },

    hideSkipConfirm() {
      modules.RewardUI?.hideSkipConfirm?.(ports.getRewardDeps());
    },

    skipReward() {
      modules.RewardUI?.skipReward?.(ports.getRewardDeps());
    },

    returnFromReward: navigation.returnFromReward,

    returnToGame: navigation.returnToGame,
  };
}
