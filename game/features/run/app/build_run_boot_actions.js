export function buildRunBootActions(fns) {
  return {
    showFullMap: fns.showFullMap,
    showEchoSkillTooltip: fns.showEchoSkillTooltip,
    hideEchoSkillTooltip: fns.hideEchoSkillTooltip,
    drawCard: fns.drawCard,
    endPlayerTurn: fns.endPlayerTurn,
    useEchoSkill: fns.useEchoSkill,
    toggleBattleChronicle: fns.toggleBattleChronicle,
    closeBattleChronicle: fns.closeBattleChronicle,
    showSkipConfirm: fns.showSkipConfirm,
    skipReward: fns.skipReward,
    hideSkipConfirm: fns.hideSkipConfirm,
    setDeckFilter: fns.setDeckFilter,
    closeDeckView: fns.closeDeckView,
    setCodexTab: fns.setCodexTab,
    closeCodex: fns.closeCodex,
  };
}
