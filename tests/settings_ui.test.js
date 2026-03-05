import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsManager } from '../game/core/settings_manager.js';
import { SettingsUI } from '../game/ui/screens/settings_ui.js';

function createLocalStorageMock(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem: vi.fn((key) => (store.has(key) ? store.get(key) : null)),
    setItem: vi.fn((key, value) => {
      store.set(key, String(value));
    }),
    removeItem: vi.fn((key) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
  };
}

function createClassList(initial = []) {
  const set = new Set(initial);
  return {
    add: (...names) => names.forEach((name) => set.add(name)),
    remove: (...names) => names.forEach((name) => set.delete(name)),
    contains: (name) => set.has(name),
    toggle: (name, force) => {
      if (force === undefined) {
        if (set.has(name)) {
          set.delete(name);
          return false;
        }
        set.add(name);
        return true;
      }
      if (force) set.add(name);
      else set.delete(name);
      return !!force;
    },
    _set: set,
  };
}

function createVolumeDoc() {
  const valueEl = { textContent: '' };
  const sliderEl = { value: '0', style: { setProperty: vi.fn() } };
  const iconEl = { textContent: '' };
  const selectors = {
    '#settings-vol-master-val': [valueEl],
    '#settings-vol-master-slider': [sliderEl],
    '#settings-vol-master-icon': [iconEl],
  };
  return {
    querySelectorAll: vi.fn((selector) => selectors[selector] || []),
    getElementById: vi.fn(() => null),
    querySelector: vi.fn(() => null),
    documentElement: { classList: createClassList(), dataset: {} },
    refs: { valueEl, sliderEl, iconEl },
  };
}

function createRebindDoc() {
  const buttonClassList = createClassList();
  const button = {
    dataset: { keybind: 'pause' },
    textContent: 'ESC',
    classList: {
      add: vi.fn((name) => buttonClassList.add(name)),
      remove: vi.fn((name) => buttonClassList.remove(name)),
      toggle: vi.fn((name, force) => buttonClassList.toggle(name, force)),
      contains: (name) => buttonClassList.contains(name),
    },
  };
  const banner = { style: {} };

  return {
    querySelector: vi.fn((selector) => {
      if (selector === '[data-keybind="pause"]') return button;
      return null;
    }),
    querySelectorAll: vi.fn((selector) => {
      if (selector === '[data-keybind]') return [button];
      return [];
    }),
    getElementById: vi.fn((id) => {
      if (id === 'settings-conflict-banner') return banner;
      return null;
    }),
    documentElement: { classList: createClassList(), dataset: {} },
    refs: { button, banner, buttonClassList },
  };
}

function createConflictDoc() {
  const makeButton = (action) => {
    const classList = createClassList();
    return {
      dataset: { keybind: action },
      classList: {
        add: vi.fn((name) => classList.add(name)),
        remove: vi.fn((name) => classList.remove(name)),
        toggle: vi.fn((name, force) => classList.toggle(name, force)),
        contains: (name) => classList.contains(name),
      },
      _classList: classList,
    };
  };

  const pauseBtn = makeButton('pause');
  const deckViewBtn = makeButton('deckView');
  const banner = { style: {}, textContent: '' };

  return {
    querySelector: vi.fn(() => null),
    querySelectorAll: vi.fn((selector) => {
      if (selector === '[data-keybind]') return [pauseBtn, deckViewBtn];
      return [];
    }),
    getElementById: vi.fn((id) => {
      if (id === 'settings-conflict-banner') return banner;
      return null;
    }),
    refs: { pauseBtn, deckViewBtn, banner },
  };
}

describe('SettingsUI', () => {
  beforeEach(() => {
    const localStorageMock = createLocalStorageMock();
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      configurable: true,
      writable: true,
    });
    SettingsManager._data = null;
    SettingsUI._activeTab = 'sound';
    SettingsUI._listeningAction = null;
    SettingsUI._keydownHandler = null;
    SettingsUI._rebindWindow = null;
  });

  it('applyVolume updates engine and synced controls', () => {
    SettingsManager.load();
    const doc = createVolumeDoc();
    const audioEngine = { setVolume: vi.fn() };

    SettingsUI.applyVolume('master', 55, { doc, audioEngine });

    expect(audioEngine.setVolume).toHaveBeenCalledWith(0.55);
    expect(SettingsManager.get('volumes.master')).toBe(0.55);
    expect(doc.refs.valueEl.textContent).toBe('55%');
    expect(doc.refs.sliderEl.value).toBe('55');
    expect(doc.refs.sliderEl.style.setProperty).toHaveBeenCalledWith('--fill-percent', '55%');
    expect(doc.refs.iconEl.textContent).toBe('🔉');
  });

  it('startRebind saves pressed code and restores button state', () => {
    SettingsManager.resetToDefaults();
    const doc = createRebindDoc();
    const listeners = {};
    const win = {
      addEventListener: vi.fn((name, handler) => {
        listeners[name] = handler;
      }),
      removeEventListener: vi.fn((name, handler) => {
        if (listeners[name] === handler) delete listeners[name];
      }),
    };

    SettingsUI.startRebind('pause', { doc, win });

    expect(doc.refs.button.textContent).toBe('입력...');
    expect(doc.refs.button.classList.add).toHaveBeenCalledWith('listening');
    expect(typeof listeners.keydown).toBe('function');

    listeners.keydown({ code: 'KeyP', preventDefault: vi.fn() });

    expect(SettingsManager.get('keybindings.pause')).toBe('KeyP');
    expect(doc.refs.button.textContent).toBe('P');
    expect(doc.refs.button.classList.remove).toHaveBeenCalledWith('listening');
    expect(win.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('applyOnBoot applies visual/accessibility toggles from stored settings', () => {
    SettingsManager.resetToDefaults();
    SettingsManager.set('visual.screenShake', false);
    SettingsManager.set('visual.hitStop', false);
    SettingsManager.set('visual.particles', false);
    SettingsManager.set('visual.reducedMotion', true);
    SettingsManager.set('accessibility.fontSize', 'large');
    SettingsManager.set('accessibility.highContrast', true);

    const doc = {
      documentElement: {
        classList: createClassList(),
        dataset: {},
      },
    };
    const ScreenShake = { setEnabled: vi.fn() };
    const HitStop = { setEnabled: vi.fn() };
    const ParticleSystem = { setEnabled: vi.fn() };

    SettingsUI.applyOnBoot({ doc, ScreenShake, HitStop, ParticleSystem });

    expect(ScreenShake.setEnabled).toHaveBeenCalledWith(false);
    expect(HitStop.setEnabled).toHaveBeenCalledWith(false);
    expect(ParticleSystem.setEnabled).toHaveBeenCalledWith(false);
    expect(doc.documentElement.classList.contains('reduced-motion')).toBe(true);
    expect(doc.documentElement.classList.contains('high-contrast')).toBe(true);
    expect(doc.documentElement.dataset.fontSize).toBe('large');
  });

  it('checkConflicts marks conflicting keys and renders conflict details', () => {
    SettingsManager.resetToDefaults();
    SettingsManager.set('keybindings.pause', 'KeyP');
    SettingsManager.set('keybindings.deckView', 'KeyP');

    const doc = createConflictDoc();
    const sortSpy = vi.spyOn(SettingsUI, '_sortKeybindingRows').mockImplementation(() => {});

    SettingsUI._checkConflicts(doc);

    expect(doc.refs.pauseBtn.classList.toggle).toHaveBeenCalledWith('conflict', true);
    expect(doc.refs.deckViewBtn.classList.toggle).toHaveBeenCalledWith('conflict', true);
    expect(doc.refs.banner.style.display).toBe('flex');
    expect(doc.refs.banner.textContent).toContain('P');
    expect(doc.refs.banner.textContent).toContain('일시정지');
    expect(doc.refs.banner.textContent).toContain('덱 보기');
    expect(sortSpy).toHaveBeenCalledWith(doc, expect.any(Set));
  });
});
