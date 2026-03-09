import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsManager } from '../game/core/settings_manager.js';
import { EndingScreenUI } from '../game/ui/screens/ending_screen_ui.js';
import { HelpPauseUI } from '../game/ui/screens/help_pause_ui.js';

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

describe('HelpPauseUI help overlay', () => {
  beforeEach(() => {
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
    const grid = menu.children[1];
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

    const deps = {
      doc,
      gs: {
        combat: { active: true },
        player: { kills: 4 },
        stats: { maxChain: 7 },
        meta: { runCount: 3, storyPieces: [], inscriptions: {} },
        currentFloor: 12,
      },
      finalizeRunOutcome: vi.fn(),
      clearActiveRunSave: vi.fn(),
      switchScreen: vi.fn(),
    };

    const showOutcomeSpy = vi.spyOn(EndingScreenUI, 'showOutcome').mockReturnValue(true);

    HelpPauseUI.confirmAbandon(deps);

    expect(deps.finalizeRunOutcome).toHaveBeenCalledWith('defeat', { echoFragments: 2, abandoned: true });
    expect(deps.clearActiveRunSave).toHaveBeenCalledTimes(1);
    expect(showOutcomeSpy).toHaveBeenCalledWith('abandon', deps);
    expect(deps.switchScreen).not.toHaveBeenCalled();
    expect(deps.gs.combat.active).toBe(false);
    expect(combatOverlay.classList.remove).toHaveBeenCalledWith('active');
    expect(doc.getElementById('abandonConfirm')).toBeNull();
    expect(doc.getElementById('pauseMenu')).toBeNull();
  });
});
