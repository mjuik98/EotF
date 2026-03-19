import {
  buildLegacyBaseDeps,
  buildLegacyFeatureDeps,
  getLegacyRoot,
} from './global_bridge_helpers.js';

export function createLegacyRootDeps(target) {
  return {
    _depsBase: null,
    getDeps() {
      if (!target._depsBase) {
        target._depsBase = buildLegacyBaseDeps(target);
      }

      const root = getLegacyRoot();
      return {
        ...target._depsBase,
        runRules: root?.RunRules || target.Modules.RunRules,
      };
    },

    getCombatDeps(extra = {}) {
      return buildLegacyFeatureDeps(target, 'combat', extra);
    },

    getEventDeps(extra = {}) {
      return buildLegacyFeatureDeps(target, 'event', extra);
    },

    getRunDeps(extra = {}) {
      return buildLegacyFeatureDeps(target, 'run', extra);
    },

    getCanvasDeps(extra = {}) {
      return buildLegacyFeatureDeps(target, 'canvas', extra);
    },

    getHudDeps(extra = {}) {
      return buildLegacyFeatureDeps(target, 'hud', extra);
    },

    getUiDeps(extra = {}) {
      return buildLegacyFeatureDeps(target, 'ui', extra);
    },
  };
}
