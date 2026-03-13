export function buildCombatRuntimeSubscriberActions(fns) {
  return {
    renderHand: fns.renderHand,
    renderCombatCards: fns.renderCombatCards,
    showCardPlayEffect: fns.showCardPlayEffect,
    showDmgPopup: fns.showDmgPopup,
    renderCombatEnemies: fns.renderCombatEnemies,
    showTurnBanner: fns.showTurnBanner,
    updateCombatLog: fns.updateCombatLog,
  };
}
