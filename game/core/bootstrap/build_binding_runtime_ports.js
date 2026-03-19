import { getModuleRegistryScope } from '../bindings/module_registry_scopes.js';

export function buildBindingRuntimePorts({ modules }) {
  const coreModules = getModuleRegistryScope(modules, 'core');
  const game = coreModules.GAME || modules?.GAME || modules?.legacyModules?.GAME;

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
