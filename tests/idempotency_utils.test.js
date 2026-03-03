import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearIdempotencyKey,
  clearIdempotencyPrefix,
  getIdempotencyEntryCount,
  runIdempotent,
} from '../game/utils/idempotency_utils.js';

describe('idempotency utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    clearIdempotencyPrefix('test:');
  });

  afterEach(() => {
    clearIdempotencyPrefix('test:');
    vi.useRealTimers();
  });

  it('drops duplicate calls within ttl and allows after ttl', () => {
    let calls = 0;
    runIdempotent('test:dup', () => { calls += 1; }, { ttlMs: 1000 });
    runIdempotent('test:dup', () => { calls += 1; }, { ttlMs: 1000 });
    expect(calls).toBe(1);

    vi.advanceTimersByTime(1001);
    runIdempotent('test:dup', () => { calls += 1; }, { ttlMs: 1000 });
    expect(calls).toBe(2);
  });

  it('supports manual key clear to allow immediate retry', () => {
    let calls = 0;
    runIdempotent('test:clear', () => { calls += 1; }, { ttlMs: 5000 });
    runIdempotent('test:clear', () => { calls += 1; }, { ttlMs: 5000 });
    expect(calls).toBe(1);

    clearIdempotencyKey('test:clear');
    runIdempotent('test:clear', () => { calls += 1; }, { ttlMs: 5000 });
    expect(calls).toBe(2);
  });

  it('releases key when async action fails', async () => {
    await expect(
      runIdempotent('test:async', async () => {
        throw new Error('boom');
      }, { ttlMs: 1000 }),
    ).rejects.toThrow('boom');

    let calls = 0;
    runIdempotent('test:async', () => {
      calls += 1;
      return 'ok';
    }, { ttlMs: 1000 });
    expect(calls).toBe(1);
  });

  it('can clear entries by prefix', () => {
    runIdempotent('test:a', () => 1, { ttlMs: 1000 });
    runIdempotent('test:b', () => 1, { ttlMs: 1000 });
    runIdempotent('other:c', () => 1, { ttlMs: 1000 });

    clearIdempotencyPrefix('test:');
    expect(getIdempotencyEntryCount()).toBe(1);
  });
});
