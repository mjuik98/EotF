export function createLegacyHudRuntimeQueryBindings({ modules, deps, fns = {} }) {
  return {
    updateUI: () => modules.HudUpdateUI?.updateUI?.(deps.getHudUpdateDeps()),
    processDirtyFlags: () => modules.HudUpdateUI?.processDirtyFlags?.(deps.getHudUpdateDeps()),
    _syncVolumeUI: () => modules.GameInit?.syncVolumeUI?.(modules.AudioEngine),
    _resetCombatInfoPanel: fns._resetCombatInfoPanel,
  };
}

export function buildLegacyWindowUiQueryGroups({ modules, deps, fns = {} }) {
  const hudQueries = createLegacyHudRuntimeQueryBindings({ modules, deps, fns });

  return {
    hud: {
      updateUI: hudQueries.updateUI,
      _syncVolumeUI: hudQueries._syncVolumeUI,
      _resetCombatInfoPanel: hudQueries._resetCombatInfoPanel,
    },
  };
}

export function buildLegacyGameApiRuntimeHudQueryGroups({ modules, deps }) {
  const hudQueries = createLegacyHudRuntimeQueryBindings({ modules, deps });

  return {
    hud: {
      updateUI: hudQueries.updateUI,
      processDirtyFlags: hudQueries.processDirtyFlags,
    },
  };
}
