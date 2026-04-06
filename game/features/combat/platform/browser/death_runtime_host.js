function pickResolvedValue(...values) {
  for (const value of values) {
    if (value !== null && typeof value !== 'undefined') {
      return value;
    }
  }

  return null;
}

export function resolveCombatDeathRuntimeContext(deps = {}) {
  const doc = deps.doc || deps.win?.document || (typeof document !== 'undefined' ? document : null);
  const win = deps.win || doc?.defaultView || (typeof window !== 'undefined' ? window : null);
  return { doc, win };
}

export function createCombatDeathRuntimeHost(deps = {}) {
  const { doc, win } = resolveCombatDeathRuntimeContext(deps);

  return {
    audioEngine: pickResolvedValue(deps.audioEngine, win?.AudioEngine),
    cleanupAllTooltips: pickResolvedValue(deps.cleanupAllTooltips, win?.CombatUI?.cleanupAllTooltips),
    doc,
    finalizeRunOutcome: pickResolvedValue(deps.finalizeRunOutcome, win?.finalizeRunOutcome),
    hudUpdateUI: pickResolvedValue(deps.hudUpdateUI, win?.HudUpdateUI),
    openEndingCodex: pickResolvedValue(
      deps.openEndingCodex,
      deps.openCodex,
      win?.openEndingCodex,
      win?.openCodex,
    ),
    particleSystem: pickResolvedValue(deps.particleSystem, win?.ParticleSystem),
    renderCombatEnemies: pickResolvedValue(deps.renderCombatEnemies, win?.renderCombatEnemies),
    renderHand: pickResolvedValue(deps.renderHand, win?.renderHand),
    restartEndingFlow: pickResolvedValue(
      deps.restartEndingFlow,
      deps.restartFromEnding,
      win?.restartEndingFlow,
      win?.restartFromEnding,
    ),
    returnFromReward: pickResolvedValue(deps.returnFromReward, win?.returnFromReward),
    returnToGame: pickResolvedValue(deps.returnToGame, win?.returnToGame),
    screenShake: pickResolvedValue(deps.screenShake, win?.ScreenShake),
    selectFragment: pickResolvedValue(
      deps.selectEndingFragment,
      deps.selectFragment,
      win?.selectEndingFragment,
      win?.selectFragment,
    ),
    showCombatSummary: pickResolvedValue(deps.showCombatSummary, win?.showCombatSummary),
    showRewardScreen: pickResolvedValue(deps.showRewardScreen, win?.showRewardScreen),
    switchScreen: pickResolvedValue(deps.switchScreen, win?.switchScreen),
    tooltipUI: pickResolvedValue(deps.tooltipUI, win?.TooltipUI),
    updateChainUI: pickResolvedValue(deps.updateChainUI, win?.updateChainUI),
    updateUI: pickResolvedValue(deps.updateUI, win?.updateUI),
    win,
  };
}
