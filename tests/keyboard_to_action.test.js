import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsManager } from '../game/core/settings_manager.js';
import {
  inputCodeToLabel,
  keyboardEventMatchesCode,
  resolveKeyboardAction,
  resolveKeyboardActionFromSettings,
} from '../game/shared/input/keyboard_to_action.js';

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

describe('keyboard_to_action', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      configurable: true,
      writable: true,
    });
    SettingsManager._data = null;
    SettingsManager.resetToDefaults();
  });

  it('matches keyboard events to binding codes and canonical actions', () => {
    expect(keyboardEventMatchesCode({ code: 'Escape', key: 'Esc' }, 'Escape')).toBe(true);
    expect(keyboardEventMatchesCode({ key: '?' }, 'Slash')).toBe(true);
    expect(keyboardEventMatchesCode({ key: 'm' }, 'KeyM')).toBe(true);

    expect(resolveKeyboardAction({ key: '?', code: 'Slash' }, {
      help: 'Slash',
      pause: 'Escape',
    })).toBe('help');

    SettingsManager.set('keybindings.nextTarget', 'KeyT');
    const bindings = SettingsManager.get('keybindings');
    expect(resolveKeyboardActionFromSettings({ key: 't', code: 'KeyT' }, bindings)).toBe('targetCycle');
    expect(resolveKeyboardActionFromSettings({ key: 'x', code: 'KeyX' }, bindings)).toBe(null);
  });

  it('formats keyboard codes into stable UI labels', () => {
    expect(inputCodeToLabel('Escape')).toBe('ESC');
    expect(inputCodeToLabel('Slash')).toBe('?');
    expect(inputCodeToLabel('KeyK')).toBe('K');
    expect(inputCodeToLabel('Digit7')).toBe('7');
    expect(inputCodeToLabel('')).toBe('');
  });
});
