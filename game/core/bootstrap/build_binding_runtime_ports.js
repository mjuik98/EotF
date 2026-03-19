import { resolveModuleRegistryLegacyCompat } from '../bindings/resolve_module_registry_legacy_compat.js';

export function buildBindingRuntimePorts({ modules }) {
  const legacyModules = resolveModuleRegistryLegacyCompat(modules);
  const game = legacyModules.GAME;

  return {
    getGameDeps: () => game?.getDeps?.() || {},
    getFeatureDeps: (feature = 'run') => {
      if (!game) return {};
      if (feature === 'combat') return game.getCombatDeps?.() || {};
      if (feature === 'event') return game.getEventDeps?.() || {};
      if (feature === 'hud') return game.getHudDeps?.() || {};
      if (feature === 'ui') return game.getUiDeps?.() || {};
      if (feature === 'canvas') return game.getCanvasDeps?.() || {};
      return game.getRunDeps?.() || {};
    },
    getRuntimeDeps: () => game?.getRunDeps?.() || {},
    getRunRuntimeDeps: () => game?.getRunDeps?.() || {},
    getCombatRuntimeDeps: () => game?.getCombatDeps?.() || {},
    getUiRuntimeDeps: () => game?.getUiDeps?.() || {},
  };
}
