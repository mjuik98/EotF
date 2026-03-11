export function buildLegacyGameAPICombatBindings(modules, fns) {
  return {
    updateCombatLog: fns.updateCombatLog,
    updateEchoSkillBtn: (overrideDeps) =>
      modules.CombatHudUI?.updateEchoSkillBtn?.(overrideDeps || modules.GAME.getHudDeps?.() || {}),
    takeDamage: (amt) => modules.GameAPI?.applyPlayerDamage?.(amt, modules.GS),
    drawCards: (count, gs) => modules.GameAPI?.drawCards?.(count, gs),
    executePlayerDraw: (gs) => modules.GameAPI?.executePlayerDraw?.(gs),
    drawCard: fns.drawCard,
    endPlayerTurn: fns.endPlayerTurn,
    renderCombatCards: fns.renderCombatCards,
    useEchoSkill: fns.useEchoSkill,
    toggleHudPin: fns.toggleHudPin,
    toggleBattleChronicle: fns.toggleBattleChronicle,
    openBattleChronicle: fns.openBattleChronicle,
    closeBattleChronicle: fns.closeBattleChronicle,
    showEchoSkillTooltip: fns.showEchoSkillTooltip,
    hideEchoSkillTooltip: fns.hideEchoSkillTooltip,
  };
}
