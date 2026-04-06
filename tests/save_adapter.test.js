import { afterEach, describe, expect, it, vi } from 'vitest';

import { SaveAdapter } from '../game/core/save_adapter.js';

describe('SaveAdapter', () => {
  const originalWindow = globalThis.window;
  const originalLocalStorage = globalThis.localStorage;

  afterEach(() => {
    globalThis.window = originalWindow;
    if (originalLocalStorage === undefined) {
      delete globalThis.localStorage;
      return;
    }
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: originalLocalStorage,
    });
  });

  it('uses injected storage for load, save, remove, and has operations', () => {
    const storage = {
      getItem: vi.fn((key) => (key === 'run' ? '{"hp":7}' : null)),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    expect(SaveAdapter.load('run', { storage })).toEqual({ hp: 7 });
    expect(SaveAdapter.has('run', { storage })).toBe(true);
    expect(SaveAdapter.save('run', { hp: 8 }, { storage })).toBe(true);

    SaveAdapter.remove('run', { storage });

    expect(storage.setItem).toHaveBeenCalledWith('run', '{"hp":8}');
    expect(storage.removeItem).toHaveBeenCalledWith('run');
  });

  it('resolves host localStorage without routing through a support barrel', () => {
    const storage = {
      getItem: vi.fn((key) => (key === 'run' ? '{"hp":9}' : null)),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    globalThis.window = undefined;
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: storage,
    });

    expect(SaveAdapter.load('run')).toEqual({ hp: 9 });
    expect(SaveAdapter.has('run')).toBe(true);
    expect(SaveAdapter.save('run', { hp: 10 })).toBe(true);
    expect(storage.setItem).toHaveBeenCalledWith('run', '{"hp":10}');
  });

  it('reports malformed loads through injected error reporter', () => {
    const reportErrorFn = vi.fn();
    const storage = {
      getItem: vi.fn(() => '{'),
    };

    expect(SaveAdapter.load('run', { storage, reportErrorFn })).toBe(null);
    expect(reportErrorFn).toHaveBeenCalledTimes(1);
  });

  it('delegates quota notices to injected storage-failure notifications', () => {
    const notifyStorageFailure = vi.fn(() => true);
    const storage = {
      setItem: vi.fn(() => {
        const error = new Error('full');
        error.name = 'QuotaExceededError';
        throw error;
      }),
    };

    expect(SaveAdapter.save('run', { hp: 8 }, { storage, notifyStorageFailure })).toBe(false);
    expect(notifyStorageFailure).toHaveBeenCalledWith(
      { key: 'run', reason: 'Storage quota exceeded' },
      expect.objectContaining({ storage, notifyStorageFailure }),
    );
  });

  it('fails fast when storage is unavailable', () => {
    const logger = { warn: vi.fn() };

    expect(SaveAdapter.save('run', { hp: 8 }, { storage: null, logger })).toBe(false);
    expect(logger.warn).toHaveBeenCalledWith('[SaveAdapter] Storage unavailable while saving.');
  });
});
