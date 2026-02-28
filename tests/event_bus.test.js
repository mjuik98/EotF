import { describe, expect, it } from 'vitest';
import { EventBus } from '../game/core/event_bus.js';

describe('EventBus', () => {
  it('drops duplicate events within dedupe window', () => {
    let callCount = 0;
    EventBus.clear('test:dedupe');
    EventBus.on('test:dedupe', () => {
      callCount += 1;
    });

    const dedupeKey = `same-action-${Date.now()}`;
    const first = EventBus.emit('test:dedupe', { value: 1 }, { dedupeKey, dedupeWindowMs: 1000 });
    const second = EventBus.emit('test:dedupe', { value: 1 }, { dedupeKey, dedupeWindowMs: 1000 });

    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(callCount).toBe(1);
  });
});
