function getLegacyRoot() {
  if (typeof window !== 'undefined') return window;
  if (typeof globalThis !== 'undefined') return globalThis;
  return null;
}

const FEATURE_MODULE_NAMES = Object.freeze({
  combat: [
    'CombatUI',
    'HudUpdateUI',
    'StatusEffectsUI',
    'TooltipUI',
    'FeedbackUI',
    'ClassMechanics',
    'CardCostUtils',
  ],
  event: [
    'EventUI',
    'TooltipUI',
    'FeedbackUI',
    'ScreenUI',
    'RunRules',
    'StoryUI',
  ],
  run: [
    'RunRules',
    'MazeSystem',
    'ScreenUI',
    'RunModeUI',
    'RunSetupUI',
    'RunStartUI',
    'HelpPauseUI',
    'FeedbackUI',
    'ClassMechanics',
    'CardCostUtils',
    'StoryUI',
  ],
  canvas: [
    'RunRules',
    'MazeSystem',
    'ClassMechanics',
    'FeedbackUI',
  ],
  hud: [
    'HudUpdateUI',
    'StatusEffectsUI',
    'TooltipUI',
    'FeedbackUI',
    'ClassMechanics',
  ],
  ui: [
    'HudUpdateUI',
    'StatusEffectsUI',
    'TooltipUI',
    'DeckModalUI',
    'CodexUI',
    'ScreenUI',
    'FeedbackUI',
  ],
});

function buildLegacyCommonDeps(game, root = getLegacyRoot()) {
  const doc = typeof document !== 'undefined' ? document : root?.document || null;
  const win = typeof window !== 'undefined' ? window : root?.window || root || null;
  return {
    gs: game.State,
    State: game.State,
    state: game.State,
    data: game.Data,
    Data: game.Data,
    audio: game.Audio,
    audioEngine: game.Audio,
    particles: game.Particle,
    particleSystem: game.Particle,
    doc,
    win,
    api: game.API,
  };
}

function buildModuleSubset(game, names = []) {
  return names.reduce((acc, name) => {
    if (Object.prototype.hasOwnProperty.call(game.Modules, name)) {
      acc[name] = game.Modules[name];
    }
    return acc;
  }, {});
}

function buildLegacyBaseDeps(game, root = getLegacyRoot()) {
  return {
    ...buildLegacyCommonDeps(game, root),
    ...game.Modules,
  };
}

function buildLegacyFeatureDeps(game, featureName, extra = {}) {
  const root = getLegacyRoot();
  const names = FEATURE_MODULE_NAMES[featureName] || [];
  return {
    ...buildLegacyCommonDeps(game, root),
    ...buildModuleSubset(game, names),
    runRules: root?.RunRules || game.Modules.RunRules,
    ...extra,
  };
}

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
  if (!mapping || !root || mapping === root) return;

  const reserved = ['window', 'document', 'location', 'top', 'parent', 'self'];
  Object.entries(mapping).forEach(([key, val]) => {
    if (reserved.includes(key)) return;
    try {
      root[key] = val;
    } catch (e) {
      console.warn(`[GAME] Could not expose global: ${key}`, e);
    }
  });
}
