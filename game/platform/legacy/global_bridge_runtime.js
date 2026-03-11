import {
  buildLegacyBaseDeps,
  buildLegacyFeatureDeps,
  exposeLegacyGlobals,
  getLegacyRoot,
} from './global_bridge_helpers.js';

export const GAME = {
  State: null,
  Data: null,
  Audio: null,
  Particle: null,
  Modules: {},
  API: {},
  _depsBase: null,

  init(gs, data, audio, particle) {
    this.State = gs;
    this.Data = data;
    this.Audio = audio;
    this.Particle = particle;
    this._depsBase = null;

    const root = getLegacyRoot();
    if (!root) return;

    root.GS = gs;
    root.GameState = gs;
    root.DATA = data;
    root.GAME = this;
    root.AudioEngine = audio;
    root.ParticleSystem = particle;
  },

  register(moduleName, moduleObj) {
    this.Modules[moduleName] = moduleObj;
    this._depsBase = null;
    if (moduleObj && moduleObj.api) {
      Object.assign(this.API, moduleObj.api);
    }
  },

  getDeps() {
    if (!this._depsBase) {
      this._depsBase = buildLegacyBaseDeps(this);
    }

    const root = getLegacyRoot();
    return {
      ...this._depsBase,
      runRules: root?.RunRules || this.Modules.RunRules,
    };
  },

  getCombatDeps(extra = {}) {
    return buildLegacyFeatureDeps(this, 'combat', extra);
  },

  getEventDeps(extra = {}) {
    return buildLegacyFeatureDeps(this, 'event', extra);
  },

  getRunDeps(extra = {}) {
    return buildLegacyFeatureDeps(this, 'run', extra);
  },

  getCanvasDeps(extra = {}) {
    return buildLegacyFeatureDeps(this, 'canvas', extra);
  },

  getHudDeps(extra = {}) {
    return buildLegacyFeatureDeps(this, 'hud', extra);
  },

  getUiDeps(extra = {}) {
    return buildLegacyFeatureDeps(this, 'ui', extra);
  },

  call(methodName, ...args) {
    const root = getLegacyRoot();
    if (typeof this.API[methodName] === 'function') {
      return this.API[methodName](...args);
    }
    if (typeof root?.[methodName] === 'function') {
      return root[methodName](...args);
    }
    console.warn(`[GAME] Method not found: ${methodName}`);
    return undefined;
  },
};

export function exposeGlobals(mapping, root = getLegacyRoot()) {
  exposeLegacyGlobals(mapping, root);
}
