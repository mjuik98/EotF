function getLegacyRoot() {
  if (typeof window !== 'undefined') return window;
  if (typeof globalThis !== 'undefined') return globalThis;
  return null;
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
      const root = getLegacyRoot();
      const doc = typeof document !== 'undefined' ? document : root?.document || null;
      const win = typeof window !== 'undefined' ? window : root?.window || root || null;
      this._depsBase = {
        gs: this.State,
        State: this.State,
        state: this.State,
        data: this.Data,
        Data: this.Data,
        audio: this.Audio,
        audioEngine: this.Audio,
        particles: this.Particle,
        particleSystem: this.Particle,
        doc,
        win,
        api: this.API,
        ...this.Modules,
      };
    }

    const root = getLegacyRoot();
    return {
      ...this._depsBase,
      runRules: root?.RunRules || this.Modules.RunRules,
    };
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
