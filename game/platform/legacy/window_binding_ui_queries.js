export function buildLegacyWindowUIQueries(modules, fns, deps) {
  return {
    updateUI: () => modules.HudUpdateUI?.updateUI?.(deps.getHudUpdateDeps()),
    _syncVolumeUI: () => modules.GameInit?.syncVolumeUI?.(modules.AudioEngine),
    showEnemyStatusTooltip: (event, statusKey) =>
      modules.CombatUI?.showEnemyStatusTooltip?.(event, statusKey, modules.GAME.getCombatDeps?.() || {}),
    hideEnemyStatusTooltip: () =>
      modules.CombatUI?.hideEnemyStatusTooltip?.(modules.GAME.getCombatDeps?.() || {}),
    _resetCombatInfoPanel: fns._resetCombatInfoPanel,
  };
}
