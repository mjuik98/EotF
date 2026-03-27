import { describe, expect, it } from 'vitest';

import {
  computeNextOutboxFlushDelay,
  createOutboxPersistedSnapshot,
  normalizeOutboxEntries,
  pruneExpiredOutboxEntries,
} from '../game/shared/save/save_outbox_state.js';

describe('save_outbox_state', () => {
  it('normalizes raw outbox entries into cloned queue snapshots', () => {
    const now = 1_000;
    const raw = [{
      key: 'echo_fallen_save',
      data: { hp: 20, nested: { floor: 3 } },
      attempts: '2',
      createdAt: '800',
    }];

    const normalized = normalizeOutboxEntries(raw, { now: () => now });

    expect(normalized).toEqual([{
      key: 'echo_fallen_save',
      data: { hp: 20, nested: { floor: 3 } },
      attempts: 2,
      createdAt: 800,
      updatedAt: 800,
      nextAttemptAt: now,
    }]);

    raw[0].data.nested.floor = 99;
    expect(normalized[0].data.nested.floor).toBe(3);
  });

  it('builds a persisted outbox snapshot without leaking live references', () => {
    const outbox = [{
      key: 'echo_fallen_meta',
      data: { codex: { enemies: ['wolf'] } },
      attempts: 1,
      createdAt: 100,
      updatedAt: 200,
      nextAttemptAt: 300,
    }];

    const snapshot = createOutboxPersistedSnapshot(outbox, { now: () => 999 });

    expect(snapshot).toEqual([{
      key: 'echo_fallen_meta',
      data: { codex: { enemies: ['wolf'] } },
      attempts: 1,
      createdAt: 100,
      updatedAt: 200,
      nextAttemptAt: 300,
    }]);

    outbox[0].data.codex.enemies.push('bear');
    expect(snapshot[0].data.codex.enemies).toEqual(['wolf']);
  });

  it('prunes expired entries and computes the next flush delay', () => {
    const expired = { key: 'old', updatedAt: 100 };
    const future = { key: 'future', nextAttemptAt: 1_600 };
    const overdue = { key: 'overdue', nextAttemptAt: 900 };

    const pruned = pruneExpiredOutboxEntries([expired, future, overdue], {
      isExpired: (entry) => entry.key === 'old',
    });

    expect(pruned).toEqual({
      changed: true,
      entries: [future, overdue],
    });
    expect(computeNextOutboxFlushDelay(pruned.entries, { now: () => 1_000 })).toBe(0);
    expect(computeNextOutboxFlushDelay([future], { now: () => 1_000 })).toBe(600);
    expect(computeNextOutboxFlushDelay([], { now: () => 1_000 })).toBe(null);
  });
});
