import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsManager } from '../game/core/settings_manager.js';
import { EndingScreenUI } from '../game/features/ui/presentation/browser/ending_screen_ui.js';
import {
  HelpPauseUI,
  __resetHelpPauseUiStateForTests,
} from '../game/features/ui/presentation/browser/help_pause_ui.js';
import {
  showMobileWarningRuntime,
  toggleHelpOverlayRuntime,
} from '../game/features/ui/presentation/browser/help_pause_ui_overlay_runtime.js';
import { togglePauseMenuRuntime } from '../game/features/ui/presentation/browser/help_pause_ui_pause_runtime.js';

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

function createElementFactory(elements) {
  return function createElement(tagName) {
    const el = {
      tagName: String(tagName || '').toUpperCase(),
      id: '',
      style: {},
      className: '',
      textContent: '',
      innerHTML: '',
      children: [],
      append(...nodes) {
        this.children.push(...nodes);
      },
      appendChild(node) {
        this.children.push(node);
        if (node?.id) elements[node.id] = node;
        return node;
      },
      remove() {
        if (this.id) delete elements[this.id];
      },
    };
    return el;
  };
}

function createDoc() {
  const elements = {};
  const createElement = createElementFactory(elements);
  const body = createElement('body');
  body.appendChild = (node) => {
    body.children.push(node);
    if (node?.id) elements[node.id] = node;
    return node;
  };

  return {
    createElement,
    body,
    defaultView: {
      getComputedStyle: (el) => ({
        display: el?.style?.display || 'flex',
        visibility: 'visible',
        opacity: '1',
        pointerEvents: 'auto',
      }),
    },
    getElementById: (id) => elements[id] || null,
    elements,
  };
}

function createHotkeyDoc() {
  const listeners = {};
  return {
    addEventListener: (name, handler) => {
      listeners[name] = handler;
    },
    querySelector: (selector) => {
      if (selector === '.settings-keybind-btn.listening') return {};
      return null;
    },
    getElementById: () => null,
    listeners,
  };
}

function findById(node, id) {
  if (!node) return null;
  if (node.id === id) return node;
  for (const child of node.children || []) {
    const found = findById(child, id);
    if (found) return found;
  }
  return null;
}

function findByClassName(node, token) {
  if (!node) return null;
  if (String(node.className || '').split(/\s+/).includes(token)) return node;
  for (const child of node.children || []) {
    const found = findByClassName(child, token);
    if (found) return found;
  }
  return null;
}

describe('HelpPauseUI help overlay', () => {
  beforeEach(() => {
    __resetHelpPauseUiStateForTests();
    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      configurable: true,
      writable: true,
    });
    SettingsManager._data = null;
    SettingsManager.resetToDefaults();
  });

  it('renders key labels from current keybinding settings', () => {
    SettingsManager.set('keybindings.pause', 'KeyP');
    SettingsManager.set('keybindings.deckView', 'KeyK');
    SettingsManager.set('keybindings.help', 'Slash');
    SettingsManager.set('keybindings.echoSkill', 'KeyR');
    SettingsManager.set('keybindings.drawCard', 'KeyG');
    SettingsManager.set('keybindings.endTurn', 'Enter');
    SettingsManager.set('keybindings.nextTarget', 'Tab');

    const doc = createDoc();
    HelpPauseUI.toggleHelp({ doc });

    const menu = doc.getElementById('helpMenu');
    expect(menu).toBeTruthy();
    const grid = findByClassName(menu, 'hp-help-grid');
    const renderedKeys = [];
    for (let i = 0; i < grid.children.length; i += 2) {
      renderedKeys.push(grid.children[i].textContent);
    }

    expect(renderedKeys).toEqual(['P', 'K', '?', 'R', 'G', 'Enter', '1 - 0', 'Tab']);

    HelpPauseUI.toggleHelp({ doc });
    expect(doc.getElementById('helpMenu')).toBeNull();
  });

  it('does not consume keys with global hotkeys while settings rebinding is active', () => {
    SettingsManager.set('keybindings.pause', 'KeyP');
    const doc = createHotkeyDoc();
    const deps = {
      doc,
      closeSettings: vi.fn(),
    };

    HelpPauseUI.bindGlobalHotkeys(deps);
    expect(typeof doc.listeners.keydown).toBe('function');

    const event = {
      key: 'p',
      code: 'KeyP',
      repeat: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      stopImmediatePropagation: vi.fn(),
    };
    doc.listeners.keydown(event);

    expect(deps.closeSettings).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('binds global hotkeys only once until the explicit test reset runs', () => {
    const doc = {
      addEventListener: vi.fn(),
      querySelector: () => null,
      getElementById: () => null,
    };

    HelpPauseUI.bindGlobalHotkeys({ doc });
    HelpPauseUI.bindGlobalHotkeys({ doc });

    expect(doc.addEventListener).toHaveBeenCalledTimes(1);

    __resetHelpPauseUiStateForTests();
    HelpPauseUI.bindGlobalHotkeys({ doc });
    expect(doc.addEventListener).toHaveBeenCalledTimes(2);
  });

  it('re-resolves live deps when toggling pause', () => {
    const doc = createDoc();
    const staleSync = vi.fn();
    const freshSync = vi.fn();

    HelpPauseUI.togglePause({
      doc,
      _syncVolumeUI: staleSync,
      getDeps: () => ({
        doc,
        _syncVolumeUI: freshSync,
        gs: {
          currentScreen: 'game',
          meta: { runCount: 2, storyPieces: ['a'] },
          currentRegion: 0,
          currentFloor: 3,
        },
      }),
    });

    expect(doc.getElementById('pauseMenu')).toBeTruthy();
    expect(freshSync).toHaveBeenCalledTimes(1);
    expect(staleSync).not.toHaveBeenCalled();
  });

  it('re-resolves live deps for each global hotkey event', () => {
    const doc = createDoc();
    const listeners = {};
    doc.addEventListener = vi.fn((name, handler) => {
      listeners[name] = handler;
    });
    doc.querySelector = vi.fn(() => null);

    HelpPauseUI.bindGlobalHotkeys({
      doc,
      gs: { currentScreen: 'title' },
      getDeps: () => ({
        doc,
        gs: {
          currentScreen: 'game',
          meta: { runCount: 2, storyPieces: ['a'] },
          currentRegion: 0,
          currentFloor: 3,
        },
        _syncVolumeUI: vi.fn(),
      }),
    });

    listeners.keydown({
      key: 'Escape',
      code: 'Escape',
      repeat: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      stopImmediatePropagation: vi.fn(),
      target: null,
    });

    expect(doc.getElementById('pauseMenu')).toBeTruthy();
  });

  it('keeps the compat ending surface wired to the feature-local facade', () => {
    expect(typeof EndingScreenUI.showOutcome).toBe('function');
  });

  it('uses injected window to decide whether to show the mobile warning', () => {
    const doc = createDoc();

    HelpPauseUI.showMobileWarning({
      doc,
      win: { innerWidth: 640 },
    });

    expect(doc.getElementById('mobileWarn')).toBeTruthy();
  });

  it('delegates mobile warning and help overlay DOM orchestration to runtime helpers', () => {
    const doc = createDoc();
    const onClose = vi.fn();

    expect(showMobileWarningRuntime({ doc, win: { innerWidth: 1200 } })).toBe(false);
    expect(showMobileWarningRuntime({ doc, win: { innerWidth: 640 } })).toBe(true);
    expect(doc.getElementById('mobileWarn')).toBeTruthy();

    expect(toggleHelpOverlayRuntime({ doc }, onClose)).toBe(true);
    const menu = doc.getElementById('helpMenu');
    expect(menu).toBeTruthy();

    const closeButton = findById(menu, 'helpCloseBtn');
    closeButton.onclick();
    expect(doc.getElementById('helpMenu')).toBeNull();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('delegates pause menu DOM orchestration to a runtime helper', () => {
    const doc = createDoc();
    const onPauseStateChange = vi.fn();
    const deps = {
      doc,
      gs: {
        meta: { runCount: 2, storyPieces: ['a'] },
        currentRegion: 0,
        currentFloor: 3,
      },
      _syncVolumeUI: vi.fn(),
    };

    const firstState = togglePauseMenuRuntime({
      deps,
      ui: {
        togglePause: vi.fn(),
        toggleHelp: vi.fn(),
        abandonRun: vi.fn(),
        confirmReturnToTitle: vi.fn(),
      },
      currentPauseOpen: false,
      onPauseStateChange,
    });

    expect(firstState).toBe(true);
    expect(doc.getElementById('pauseMenu')).toBeTruthy();
    expect(deps._syncVolumeUI).toHaveBeenCalledTimes(1);
    expect(onPauseStateChange).toHaveBeenCalledWith(true);

    const secondState = togglePauseMenuRuntime({
      deps,
      ui: {
        togglePause: vi.fn(),
        toggleHelp: vi.fn(),
        abandonRun: vi.fn(),
        confirmReturnToTitle: vi.fn(),
      },
      currentPauseOpen: firstState,
      onPauseStateChange,
    });

    expect(secondState).toBe(false);
    expect(doc.getElementById('pauseMenu')).toBeNull();
    expect(onPauseStateChange).toHaveBeenLastCalledWith(false);
  });
});

describe('HelpPauseUI abandon flow', () => {
  it('shows the cinematic ending result instead of switching to death screen', () => {
    const doc = createDoc();
    const abandonConfirm = doc.createElement('div');
    abandonConfirm.id = 'abandonConfirm';
    doc.body.appendChild(abandonConfirm);

    const pauseMenu = doc.createElement('div');
    pauseMenu.id = 'pauseMenu';
    doc.body.appendChild(pauseMenu);

    const combatOverlay = doc.createElement('div');
    combatOverlay.id = 'combatOverlay';
    combatOverlay.classList = { remove: vi.fn() };
    doc.body.appendChild(combatOverlay);

    const floatingHpShell = doc.createElement('div');
    floatingHpShell.id = 'ncFloatingHpShell';
    doc.body.appendChild(floatingHpShell);

    const hudUpdateUI = {
      resetCombatUI: vi.fn(),
    };

    const deps = {
      doc,
      gs: {
        combat: { active: true },
        player: { kills: 4 },
        stats: { maxChain: 7 },
        meta: { runCount: 3, storyPieces: [], inscriptions: {} },
        currentFloor: 12,
      },
      hudUpdateUI,
      finalizeRunOutcome: vi.fn(),
      clearActiveRunSave: vi.fn(),
      switchScreen: vi.fn(),
    };

    const showOutcomeSpy = vi.spyOn(EndingScreenUI, 'showOutcome').mockReturnValue(true);

    HelpPauseUI.confirmAbandon(deps);

    expect(deps.finalizeRunOutcome).toHaveBeenCalledWith('defeat', { echoFragments: 2, abandoned: true }, { gs: deps.gs });
    expect(deps.clearActiveRunSave).toHaveBeenCalledTimes(1);
    expect(showOutcomeSpy).toHaveBeenCalledWith('abandon', deps);
    expect(deps.switchScreen).not.toHaveBeenCalled();
    expect(deps.gs.combat.active).toBe(false);
    expect(hudUpdateUI.resetCombatUI).toHaveBeenCalledWith(expect.objectContaining({ doc, gs: deps.gs }));
    expect(doc.getElementById('abandonConfirm')).toBeNull();
    expect(doc.getElementById('pauseMenu')).toBeNull();
    expect(doc.getElementById('ncFloatingHpShell')).toBeNull();
  });
});
