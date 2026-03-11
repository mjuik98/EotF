export function createEventRewardActions(modules, _fns, ports) {
  return {
    triggerRandomEvent() {
      modules.EventUI?.triggerRandomEvent?.(ports.getEventDeps());
    },

    _updateEventGoldBar() {
      modules.EventUI?.updateEventGoldBar?.(ports.getEventDeps());
    },

    showEvent(event) {
      modules.EventUI?.showEvent?.(event, ports.getEventDeps());
    },

    resolveEvent(choiceIdx) {
      modules.EventUI?.resolveEvent?.(choiceIdx, ports.getEventDeps());
    },

    showShop() {
      modules.EventUI?.showShop?.(ports.getEventDeps());
    },

    showRestSite() {
      modules.EventUI?.showRestSite?.(ports.getEventDeps());
    },

    showCardDiscard(gs, isBurn = false) {
      modules.EventUI?.showCardDiscard?.(gs, isBurn, ports.getEventDeps());
    },

    showItemShop(gs) {
      modules.EventUI?.showItemShop?.(gs, ports.getEventDeps());
    },

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
