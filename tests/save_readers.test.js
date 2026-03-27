import { describe, expect, it, vi } from 'vitest';

import {
  readMetaSaveData,
  readRunSaveRecord,
  sanitizeLoadedSaveEntry,
} from '../game/shared/save/save_readers.js';

describe('save_readers', () => {
  it('drops unsupported future-version queued saves through the queued drop handler', () => {
    const dropOutboxKey = vi.fn();
    const removePersistedKey = vi.fn();
    const logWarn = vi.fn();

    const result = sanitizeLoadedSaveEntry(
      { version: 999 },
      {
        key: 'echo_fallen_save',
        label: 'run',
        queued: true,
        isUnsupportedFutureVersion: () => true,
        dropOutboxKey,
        removePersistedKey,
        logWarn,
      },
    );

    expect(result).toBe(null);
    expect(dropOutboxKey).toHaveBeenCalledWith('echo_fallen_save');
    expect(removePersistedKey).not.toHaveBeenCalled();
    expect(logWarn).toHaveBeenCalledWith('[SaveSystem] Dropped unsupported future-version queued run save.');
  });

  it('reads saved run data before queued fallbacks and reports the save state', () => {
    const saveAdapter = {
      load: vi.fn((key) => {
        if (key === 'save') {
          return { version: 2, player: { hp: 20, maxHp: 30, deck: [], gold: 0 }, currentRegion: 2 };
        }
        return null;
      }),
    };

    const result = readRunSaveRecord({
      outbox: [{
        key: 'save',
        data: { version: 2, player: { hp: 10, maxHp: 30, deck: [], gold: 0 }, currentRegion: 1 },
      }],
      saveAdapter,
      saveKey: 'save',
      isUnsupportedFutureVersion: () => false,
      migrateSave: (data) => ({ ...data, migrated: true }),
      validateSaveData: () => true,
      dropOutboxKey: () => {},
      removePersistedKey: () => {},
      logWarn: () => {},
      logError: () => {},
    });

    expect(result).toEqual({
      data: { version: 2, player: { hp: 20, maxHp: 30, deck: [], gold: 0 }, currentRegion: 2, migrated: true },
      saveState: 'saved',
    });
  });

  it('hydrates meta preview data from queued fallback and ensures runConfig exists', () => {
    const result = readMetaSaveData({
      outbox: [{
        key: 'meta',
        data: { version: 2, codex: { enemies: ['wolf'] } },
      }],
      saveAdapter: { load: () => null },
      metaKey: 'meta',
      isUnsupportedFutureVersion: () => false,
      migrateSave: (data) => data,
      ensureMetaRunConfig: (data) => {
        if (!data.runConfig) data.runConfig = {};
      },
      dropOutboxKey: () => {},
      removePersistedKey: () => {},
      logWarn: () => {},
      logError: () => {},
    });

    expect(result).toEqual({
      version: 2,
      codex: { enemies: ['wolf'] },
      runConfig: {},
    });
  });
});
