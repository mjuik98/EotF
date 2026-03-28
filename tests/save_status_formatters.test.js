import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  buildSaveQueueSuffix,
  buildSaveRecoveryMeta,
  formatElapsedTiming,
  formatRetryTiming,
} from '../game/shared/save/save_status_formatters.js';

describe('save_status_formatters', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats retry timing for pending and elapsed retries', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

    expect(formatRetryTiming(new Date('2026-01-01T00:00:05Z').getTime())).toBe('5초 후 재시도');
    expect(formatRetryTiming(new Date('2025-12-31T23:59:59Z').getTime())).toBe('곧 재시도');
    expect(formatRetryTiming(0)).toBe('');
  });

  it('formats elapsed timing across seconds, minutes, hours, and days', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-02T00:00:00Z'));

    expect(formatElapsedTiming(new Date('2026-01-01T23:59:40Z').getTime())).toBe('20초 전');
    expect(formatElapsedTiming(new Date('2026-01-01T23:55:00Z').getTime())).toBe('5분 전');
    expect(formatElapsedTiming(new Date('2026-01-01T21:00:00Z').getTime())).toBe('3시간 전');
    expect(formatElapsedTiming(new Date('2025-12-30T00:00:00Z').getTime())).toBe('3일 전');
  });

  it('builds recovery meta and queue suffix strings from shared save metrics', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

    expect(buildSaveRecoveryMeta({
      retryFailures: 2,
      lastFailureAt: new Date('2025-12-31T23:59:30Z').getTime(),
      nextRetryAt: new Date('2026-01-01T00:00:05Z').getTime(),
    })).toBe('재시도 실패 2회 · 마지막 실패 30초 전 · 5초 후 재시도');

    expect(buildSaveQueueSuffix({
      queueDepth: 3,
      retryFailures: 2,
      nextRetryAt: new Date('2026-01-01T00:00:05Z').getTime(),
    })).toBe('대기 3건 · 재시도 실패 2회 · 다음 재시도 5초 후');
  });
});
