export function createRewardActions(modules, ports) {
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

    returnToGame(fromReward) {
      modules.RunReturnUI?.returnToGame?.(fromReward, ports.getRunReturnDeps());
    },
  };
}
