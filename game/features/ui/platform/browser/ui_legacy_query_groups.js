import { resolveUiActionModules } from './resolve_ui_action_modules.js';

export function createLegacyHudRuntimeQueryBindings({ modules, deps, fns = {} }) {
  const resolvedModules = resolveUiActionModules(modules);

  return {
    updateUI: () => resolvedModules.HudUpdateUI?.updateUI?.(deps.getHudUpdateDeps()),
    processDirtyFlags: () => resolvedModules.HudUpdateUI?.processDirtyFlags?.(deps.getHudUpdateDeps()),
    _syncVolumeUI: () => resolvedModules.GameInit?.syncVolumeUI?.(resolvedModules.AudioEngine),
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
