import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsManager } from '../game/core/settings_manager.js';
import {
  handleRunInputAction,
  handleRunSessionHotkeyEvent,
} from '../game/features/run_session/public.js';
import { INPUT_ACTION_TARGET_CYCLE } from '../game/shared/input/public.js';

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

function createDoc(elements = {}) {
  return {
    querySelector: vi.fn(() => null),
    getElementById: (id) => elements[id] || null,
    defaultView: {
      getComputedStyle: (el) => ({
        display: el?.style?.display || 'block',
        visibility: 'visible',
        opacity: el?.classList?.contains?.('active') ? '1' : '0',
        pointerEvents: el?.classList?.contains?.('active') ? 'auto' : 'none',
      }),
    },
  };
}

describe('run_session_hotkey_runtime', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      configurable: true,
      writable: true,
    });
    SettingsManager._data = null;
    SettingsManager.resetToDefaults();
  });

  it('routes a normalized action through the run-session action handler', () => {
    const toggleHelp = vi.fn();

    const handled = handleRunInputAction('help', {
      event: { preventDefault: vi.fn() },
      doc: createDoc(),
      ui: {
        toggleHelp,
        togglePause: vi.fn(),
        isHelpOpen: () => false,
      },
      gs: { currentScreen: 'game', combat: { active: false } },
      deps: {},
      inGame: true,
      runHotkeyState: { mode: 'exploration', activeSurface: null, allowsCombatHotkeys: false },
      hotkeyPolicy: { help: true, deckView: true, codex: true, pause: true },
    });

    expect(handled).toBe(true);
    expect(toggleHelp).toHaveBeenCalledTimes(1);
  });

  it('converts keyboard events into canonical actions before delegating', () => {
    SettingsManager.set('keybindings.nextTarget', 'KeyT');

    const onTargetCycle = vi.fn();
    const event = { key: 't', code: 'KeyT', preventDefault: vi.fn(), repeat: false };
    const handled = handleRunSessionHotkeyEvent(event, {
      doc: createDoc(),
      keybindings: SettingsManager.get('keybindings'),
      ui: {
        toggleHelp: vi.fn(),
        togglePause: vi.fn(),
        isHelpOpen: () => false,
      },
      deps: {
        gs: {
          currentScreen: 'combat',
          combat: {
            active: true,
            playerTurn: true,
            enemies: [{ hp: 5 }],
          },
        },
      },
      onTargetCycle,
    });

    expect(handled).toBe(true);
    expect(onTargetCycle).toHaveBeenCalledWith(INPUT_ACTION_TARGET_CYCLE, expect.objectContaining({
      event,
    }));
  });
});
