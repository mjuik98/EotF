import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  SaveSystem,
  bindSaveNotifications,
  bindSaveStorage,
} from '../game/shared/save/public.js';
import { SaveAdapter } from '../game/core/save_adapter.js';

describe('save notification bindings', () => {
  beforeEach(() => {
    bindSaveStorage(SaveAdapter);
    bindSaveNotifications(null);
    SaveSystem.clearOutbox();
    SaveSystem.resetOutboxMetrics();
  });

  it('routes save status updates through bound notification ports', () => {
    const saveStatus = vi.fn();
    bindSaveNotifications({ saveStatus });

    const shown = SaveSystem.showSaveStatus(
      { status: 'queued', persisted: false, queueDepth: 1 },
      { doc: { body: null } },
    );

    expect(shown).toBe(true);
    expect(saveStatus).toHaveBeenCalledWith({
      status: 'queued',
      persisted: false,
      queueDepth: 1,
    }, expect.objectContaining({
      doc: { body: null },
    }));
  });

  it('routes quota failures through an injected storage failure notifier', () => {
    const storageFailure = vi.fn();

    const ok = SaveAdapter.save('echo_fallen_save', { ok: true }, {
      notifyStorageFailure: storageFailure,
      storage: {
        setItem() {
          const error = new Error('quota');
          error.name = 'QuotaExceededError';
          throw error;
        },
      },
    });

    expect(ok).toBe(false);
    expect(storageFailure).toHaveBeenCalledWith({
      key: 'echo_fallen_save',
      reason: 'Storage quota exceeded',
    }, expect.any(Object));
  });
});
