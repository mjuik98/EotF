export function buildCombatFeedbackActionGroup(ctx) {
  const { modules, ports } = ctx;

  return {
    toggleHudPin() {
      modules.CombatHudUI?.toggleHudPin?.(ports.getHudDeps());
    },

    showEchoSkillTooltip(event) {
      modules.CombatHudUI?.showEchoSkillTooltip?.(event, ports.getHudDeps());
    },

    hideEchoSkillTooltip() {
      modules.CombatHudUI?.hideEchoSkillTooltip?.(ports.getHudDeps());
    },

    showTurnBanner(type) {
      modules.CombatHudUI?.showTurnBanner?.(type, ports.getHudDeps());
    },

    updateCombatLog() {
      modules.CombatHudUI?.updateCombatLog?.(ports.getHudDeps());
    },

    updateEchoSkillBtn() {
      modules.CombatHudUI?.updateEchoSkillBtn?.(ports.getHudDeps());
    },

    toggleBattleChronicle() {
      modules.CombatHudUI?.toggleBattleChronicle?.(ports.getHudDeps());
    },

    openBattleChronicle() {
      modules.CombatHudUI?.openBattleChronicle?.(ports.getHudDeps());
    },

    closeBattleChronicle() {
      modules.CombatHudUI?.closeBattleChronicle?.(ports.getHudDeps());
    },

    showCombatSummary(dealt, taken, kills) {
      modules.FeedbackUI?.showCombatSummary?.(dealt, taken, kills, ports.getFeedbackDeps());
    },

    showDmgPopup(dmg, x, y, color = '#ff3366') {
      modules.FeedbackUI?.showDmgPopup?.(dmg, x, y, color, ports.getFeedbackDeps());
    },

    showEdgeDamage() {
      modules.FeedbackUI?.showEdgeDamage?.(ports.getFeedbackDeps());
    },

    showEchoBurstOverlay() {
      modules.FeedbackUI?.showEchoBurstOverlay?.(ports.getFeedbackDeps());
    },

    showCardPlayEffect(card) {
      modules.FeedbackUI?.showCardPlayEffect?.(card, ports.getFeedbackDeps());
    },

    showItemToast(item, options = {}) {
      modules.FeedbackUI?.showItemToast?.(item, ports.getFeedbackDeps(), options);
    },

    showLegendaryAcquire(item) {
      modules.FeedbackUI?.showLegendaryAcquire?.(item, ports.getFeedbackDeps());
    },

    showChainAnnounce(text) {
      modules.FeedbackUI?.showChainAnnounce?.(text, ports.getFeedbackDeps());
    },

    showWorldMemoryNotice(text) {
      modules.FeedbackUI?.showWorldMemoryNotice?.(text, ports.getFeedbackDeps());
    },

    _flushNoticeQueue() {
      modules.FeedbackUI?._flushNoticeQueue?.(ports.getFeedbackDeps());
    },
  };
}
