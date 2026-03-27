import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsManager } from '../game/core/settings_manager.js';
import {
  getInputBindingCode,
  getInputBindingMap,
  getInputSettingsKey,
} from '../game/shared/input/input_binding_resolver.js';
import { INPUT_ACTION_TARGET_CYCLE } from '../game/shared/input/input_action_ids.js';

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

describe('input_binding_resolver', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      configurable: true,
      writable: true,
    });
    SettingsManager._data = null;
    SettingsManager.resetToDefaults();
  });

  it('reads default and persisted keybindings through SettingsManager', () => {
    expect(getInputBindingCode('pause', undefined, SettingsManager.get('keybindings'))).toBe('Escape');
    expect(getInputBindingCode('help', undefined, SettingsManager.get('keybindings'))).toBe('Slash');
    expect(getInputBindingCode(
      INPUT_ACTION_TARGET_CYCLE,
      undefined,
      SettingsManager.get('keybindings'),
    )).toBe('Tab');
    expect(getInputSettingsKey(INPUT_ACTION_TARGET_CYCLE)).toBe('nextTarget');

    SettingsManager.set('keybindings.pause', 'KeyP');
    SettingsManager.set('keybindings.nextTarget', 'KeyT');

    expect(getInputBindingCode('pause', undefined, SettingsManager.get('keybindings'))).toBe('KeyP');
    expect(getInputBindingCode(
      INPUT_ACTION_TARGET_CYCLE,
      undefined,
      SettingsManager.get('keybindings'),
    )).toBe('KeyT');
  });

  it('builds a resolved binding map keyed by canonical action ids', () => {
    SettingsManager.set('keybindings.help', 'KeyH');
    const bindingMap = getInputBindingMap(SettingsManager.get('keybindings'));

    expect(bindingMap.pause).toBe('Escape');
    expect(bindingMap.help).toBe('KeyH');
    expect(bindingMap.targetCycle).toBe('Tab');
  });
});
