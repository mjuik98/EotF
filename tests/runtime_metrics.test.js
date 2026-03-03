import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../game/core/event_bus.js';
import { ErrorCodes, ErrorSeverity } from '../game/core/error_codes.js';
import { reportError } from '../game/core/error_reporter.js';
import { getRuntimeMetrics, resetRuntimeMetrics } from '../game/core/runtime_metrics.js';

describe('runtime metrics', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    EventBus.clear();
    resetRuntimeMetrics();
  });

  afterEach(() => {
    EventBus.clear();
    resetRuntimeMetrics();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('tracks top event frequency from EventBus emissions', () => {
    EventBus.emit('metrics:a');
    EventBus.emit('metrics:b');
    EventBus.emit('metrics:a');

    const metrics = getRuntimeMetrics({ topN: 2 });
    const currentMinute = metrics.perMinute[metrics.perMinute.length - 1];

    expect(metrics.totals.events).toBe(3);
    expect(metrics.recent.events).toBe(3);
    expect(metrics.topEvents[0]).toEqual({ event: 'metrics:a', count: 2 });
    expect(metrics.topEvents[1]).toEqual({ event: 'metrics:b', count: 1 });
    expect(currentMinute.events).toBe(3);
    expect(currentMinute.errors).toBe(0);
  });

  it('tracks error counts and minute-level error-rate trend', () => {
    EventBus.emit('metrics:event-1');
    EventBus.emit('metrics:event-2');
    reportError('first', {
      code: ErrorCodes.INVALID_ACTION,
      severity: ErrorSeverity.WARN,
      context: 'runtime_metrics_test',
    });

    vi.advanceTimersByTime(60_000);

    EventBus.emit('metrics:event-3');
    reportError('second', {
      code: ErrorCodes.SAVE_LOAD_FAILED,
      severity: ErrorSeverity.ERROR,
      context: 'runtime_metrics_test',
    });
    reportError('third', {
      code: ErrorCodes.SAVE_LOAD_FAILED,
      severity: ErrorSeverity.ERROR,
      context: 'runtime_metrics_test',
    });

    const metrics = getRuntimeMetrics({ topN: 2 });
    const latestMinute = metrics.perMinute[metrics.perMinute.length - 1];
    const prevMinute = metrics.perMinute[metrics.perMinute.length - 2];

    expect(metrics.totals.events).toBe(3);
    expect(metrics.totals.errors).toBe(3);
    expect(metrics.recent.errorRate).toBe(1);
    expect(metrics.topErrors[0]).toEqual({ code: ErrorCodes.SAVE_LOAD_FAILED, count: 2 });
    expect(metrics.topErrors[1]).toEqual({ code: ErrorCodes.INVALID_ACTION, count: 1 });
    expect(prevMinute.events).toBe(2);
    expect(prevMinute.errors).toBe(1);
    expect(latestMinute.events).toBe(1);
    expect(latestMinute.errors).toBe(2);
    expect(latestMinute.errorRate).toBe(2);
  });

  it('does not count dropped duplicate events', () => {
    const dedupeKey = 'same-action';
    const first = EventBus.emit('metrics:dup', null, { dedupeKey, dedupeWindowMs: 1000 });
    const second = EventBus.emit('metrics:dup', null, { dedupeKey, dedupeWindowMs: 1000 });
    const metrics = getRuntimeMetrics();

    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(metrics.totals.events).toBe(1);
    expect(metrics.topEvents[0]).toEqual({ event: 'metrics:dup', count: 1 });
  });
});

