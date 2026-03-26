const STORAGE_KEY = 'eotf_settings';

const DEFAULTS = {
  volumes: {
    master: 0.8,
    sfx: 0.8,
    ambient: 0.4,
  },
  visual: {
    particles: true,
    screenShake: true,
    hitStop: true,
    reducedMotion: false,
  },
  accessibility: {
    fontSize: 'normal',
    highContrast: false,
    tooltipDwell: false,
  },
  keybindings: {
    endTurn: 'Enter',
    echoSkill: 'KeyE',
    drawCard: 'KeyQ',
    pause: 'Escape',
    help: 'Slash',
    deckView: 'KeyD',
    codex: 'KeyC',
    nextTarget: 'Tab',
  },
};

function clone(obj) {
  try {
    return structuredClone(obj);
  } catch {
    return JSON.parse(JSON.stringify(obj));
  }
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export const SettingsManager = {
  _data: null,

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this._data = clone(DEFAULTS);
        return this._data;
      }
      const parsed = JSON.parse(raw);
      this._data = this._deepMerge(clone(DEFAULTS), parsed);
      return this._data;
    } catch (error) {
      console.warn('[SettingsManager] Load failed, using defaults:', error);
      this._data = clone(DEFAULTS);
      return this._data;
    }
  },

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
    } catch (error) {
      console.warn('[SettingsManager] Save failed:', error);
    }
  },

  get(path) {
    this._ensureLoaded();
    return path.split('.').reduce((obj, key) => obj?.[key], this._data);
  },

  set(path, value) {
    this._ensureLoaded();
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => obj?.[key], this._data);

    if (!target || !Object.prototype.hasOwnProperty.call(target, lastKey)) {
      console.warn(`[SettingsManager] Unknown path: ${path}`);
      return;
    }

    target[lastKey] = value;
    this.save();
  },

  getAll() {
    this._ensureLoaded();
    return clone(this._data);
  },

  getDefaults() {
    return clone(DEFAULTS);
  },

  resetToDefaults() {
    this._data = clone(DEFAULTS);
    this.save();
    return this._data;
  },

  _ensureLoaded() {
    if (!this._data) this.load();
  },

  _deepMerge(target, source) {
    if (!isObject(source)) return target;

    for (const key of Object.keys(source)) {
      if (!Object.prototype.hasOwnProperty.call(target, key)) continue;

      if (isObject(target[key]) && isObject(source[key])) {
        target[key] = this._deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }

    return target;
  },
};
