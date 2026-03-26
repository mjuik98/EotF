export function buildCombatTurnBaseContract(ctx) {
  const {
    getRefs,
    getCombatDeps,
    getHudDeps,
  } = ctx;
  const refs = getRefs();
  const combatRefs = refs.featureRefs?.combat || {};

  return {
    ...getCombatDeps(),
    enemyTurn: combatRefs.enemyTurn || refs.enemyTurn,
    updateChainUI: combatRefs.updateChainUI || refs.updateChainUI,
    showTurnBanner: combatRefs.showTurnBanner || refs.showTurnBanner,
    renderCombatEnemies: combatRefs.renderCombatEnemies || refs.renderCombatEnemies,
    renderCombatCards: combatRefs.renderCombatCards || refs.renderCombatCards,
    updateStatusDisplay: refs.updateStatusDisplay,
    updateClassSpecialUI: refs.updateClassSpecialUI,
    updateCombatEnergy: (gs) => (combatRefs.HudUpdateUI || refs.HudUpdateUI)
      ?.updateCombatEnergy?.(gs, getHudDeps()),
    hudUpdateUI: combatRefs.HudUpdateUI || refs.HudUpdateUI,
    updateUI: combatRefs.updateUI || refs.updateUI,
    cardCostUtils: combatRefs.CardCostUtils || refs.CardCostUtils,
    classMechanics: combatRefs.ClassMechanics || refs.ClassMechanics,
    showEchoBurstOverlay: combatRefs.showEchoBurstOverlay || refs.showEchoBurstOverlay,
    showDmgPopup: combatRefs.showDmgPopup || refs.showDmgPopup,
    shuffleArray: (arr) => refs.RandomUtils?.shuffleArray?.(arr) || arr,
  };
}
