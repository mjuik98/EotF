import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsManager } from '../game/core/settings_manager.js';

const hoisted = vi.hoisted(() => ({
  ensureSettingsModalShell: vi.fn(),
}));

vi.mock('../game/features/ui/platform/browser/ensure_settings_modal_shell.js', () => ({
  ensureSettingsModalShell: hoisted.ensureSettingsModalShell,
}));

import {
  closeSettingsModal,
  getLiveSettingsDeps,
  openSettingsModal,
  startSettingsRebind,
} from '../game/ui/screens/settings_ui_runtime.js';

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
  };
}

function createUi(overrides = {}) {
  return {
    _activeTab: 'sound',
    _runtimeDeps: {},
    _listeningAction: null,
    _keydownHandler: null,
    _rebindWindow: null,
    _bindDomEvents: vi.fn(),
    _syncAllTabs: vi.fn(),
    setTab: vi.fn(),
    _syncKeybindingDisplay: vi.fn(),
    _checkConflicts: vi.fn(),
    ...overrides,
  };
}

describe('settings_ui_runtime', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      configurable: true,
      writable: true,
    });
    SettingsManager._data = null;
    SettingsManager.resetToDefaults();
  });

  it('opens the settings modal and syncs tab state through the helper', () => {
    const modal = { classList: createClassList() };
    const doc = {
      getElementById: vi.fn((id) => (id === 'settingsModal' ? modal : null)),
    };
    const audioEngine = { playEvent: vi.fn(), playClick: vi.fn() };
    const ui = createUi();

    const didOpen = openSettingsModal(ui, { doc, audioEngine });

    expect(didOpen).toBe(true);
    expect(hoisted.ensureSettingsModalShell).toHaveBeenCalledWith(doc);
    expect(ui._runtimeDeps).toEqual({ doc, audioEngine });
    expect(ui._bindDomEvents).toHaveBeenCalledWith(doc);
    expect(ui._syncAllTabs).toHaveBeenCalledWith(doc);
    expect(ui.setTab).toHaveBeenCalledWith('sound', { doc, audioEngine });
    expect(modal.classList.contains('active')).toBe(true);
    expect(audioEngine.playEvent).toHaveBeenCalledWith('ui', 'click');
    expect(audioEngine.playClick).not.toHaveBeenCalled();
  });

  it('starts rebind and cancels cleanly on Escape', () => {
    const listeners = {};
    const buttonClassList = createClassList();
    const button = {
      textContent: 'ESC',
      classList: {
        add: vi.fn((name) => buttonClassList.add(name)),
        remove: vi.fn((name) => buttonClassList.remove(name)),
      },
    };
    const win = {
      addEventListener: vi.fn((name, handler) => {
        listeners[name] = handler;
      }),
      removeEventListener: vi.fn((name, handler) => {
        if (listeners[name] === handler) delete listeners[name];
      }),
    };
    const doc = {
      querySelector: vi.fn((selector) => (selector === '[data-keybind="pause"]' ? button : null)),
    };
    const ui = createUi({ _runtimeDeps: { doc, win } });

    startSettingsRebind(ui, 'pause', { doc, win });
    listeners.keydown({ code: 'Escape', preventDefault: vi.fn() });

    expect(button.classList.add).toHaveBeenCalledWith('listening');
    expect(button.classList.remove).toHaveBeenCalledWith('listening');
    expect(ui._syncKeybindingDisplay).toHaveBeenCalledWith('pause', doc);
    expect(ui._checkConflicts).toHaveBeenCalledWith(doc);
    expect(ui._listeningAction).toBe(null);
    expect(ui._rebindWindow).toBe(null);
  });

  it('closes the settings modal and forwards live deps', () => {
    const modal = { classList: createClassList(['active']) };
    const doc = {
      getElementById: vi.fn((id) => (id === 'settingsModal' ? modal : null)),
      querySelector: vi.fn(() => null),
    };
    const win = { marker: true };
    const audioEngine = { playEvent: vi.fn(), playClick: vi.fn() };
    const ui = createUi({
      _runtimeDeps: { audioEngine, extra: 1, win },
      _listeningAction: 'pause',
      _syncKeybindingDisplay: vi.fn(),
      _checkConflicts: vi.fn(),
    });
    ui._keydownHandler = () => {};
    ui._rebindWindow = { removeEventListener: vi.fn() };

    const liveDeps = getLiveSettingsDeps(ui, doc);
    expect(liveDeps).toEqual({ audioEngine, extra: 1, doc, win });

    closeSettingsModal(ui, { doc, audioEngine });

    expect(modal.classList.contains('active')).toBe(false);
    expect(audioEngine.playEvent).toHaveBeenCalledWith('ui', 'click');
    expect(audioEngine.playClick).not.toHaveBeenCalled();
  });
});
