import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsManager } from '../game/core/settings_manager.js';
import { bindSettingsStorage } from '../game/platform/browser/settings/settings_storage.js';
import { Logger } from '../game/utils/logger.js';

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

describe('SettingsManager', () => {
  beforeEach(() => {
    const localStorageMock = createLocalStorageMock();
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      configurable: true,
      writable: true,
    });
    bindSettingsStorage(null);
    SettingsManager._data = null;
  });

  it('loads defaults when nothing is stored', () => {
    const data = SettingsManager.load();

    expect(data.volumes.master).toBe(0.8);
    expect(data.volumes.sfx).toBe(0.8);
    expect(data.volumes.ambient).toBe(0.4);
    expect(data.visual.screenShake).toBe(true);
    expect(data.accessibility.fontSize).toBe('normal');
    expect(data.keybindings.pause).toBe('Escape');
  });

  it('deep-merges known keys and ignores unknown roots', () => {
    const persisted = {
      volumes: { master: 0.5 },
      visual: { particles: false },
      keybindings: { pause: 'KeyP' },
      unknownRoot: { ignored: true },
    };
    globalThis.localStorage.setItem('eotf_settings', JSON.stringify(persisted));

    const data = SettingsManager.load();

    expect(data.volumes.master).toBe(0.5);
    expect(data.volumes.sfx).toBe(0.8);
    expect(data.visual.particles).toBe(false);
    expect(data.keybindings.pause).toBe('KeyP');
    expect(data).not.toHaveProperty('unknownRoot');
  });

  it('sets known paths and persists data', () => {
    SettingsManager.load();
    SettingsManager.set('visual.particles', false);

    expect(SettingsManager.get('visual.particles')).toBe(false);
    expect(globalThis.localStorage.setItem).toHaveBeenCalled();

    const savedRaw = globalThis.localStorage.getItem('eotf_settings');
    expect(savedRaw).toBeTruthy();
    const saved = JSON.parse(savedRaw);
    expect(saved.visual.particles).toBe(false);
  });

  it('rejects unknown paths without mutating state', () => {
    const warnSpy = vi.spyOn(Logger, 'warn').mockImplementation(() => {});
    SettingsManager.load();
    const before = SettingsManager.getAll();

    SettingsManager.set('visual.unknownSetting', true);
    const after = SettingsManager.getAll();

    expect(after).toEqual(before);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('uses bound storage instead of reading global localStorage directly', () => {
    const boundStorage = createLocalStorageMock({
      eotf_settings: JSON.stringify({
        keybindings: { pause: 'KeyP' },
      }),
    });
    bindSettingsStorage(boundStorage);

    const data = SettingsManager.load();

    expect(data.keybindings.pause).toBe('KeyP');
    expect(boundStorage.getItem).toHaveBeenCalledWith('eotf_settings');
  });
});
