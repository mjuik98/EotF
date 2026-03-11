import { describe, expect, it, vi } from 'vitest';

import { createResolveEventSessionUseCase } from '../game/app/event/use_cases/resolve_event_session_use_case.js';

describe('resolve_event_session_use_case', () => {
  it('runs the event choice flow through the idempotent guard and clears the session on finish', () => {
    const clearCurrentEvent = vi.fn();
    const resolveEventSession = createResolveEventSessionUseCase({ clearCurrentEvent });
    const event = { id: 'evt-2', persistent: false };
    const gs = { _eventLock: false };
    const resolveEventChoiceFlow = vi.fn(() => 'resolved');
    const runIdempotent = vi.fn((_key, runner) => runner());
    const finishEventFlow = vi.fn((_doc, _gs, _deps, onDone) => onDone?.());

    const result = resolveEventSession({
      choiceIdx: 1,
      gs,
      event,
      doc: {},
      deps: { token: true },
      audioEngine: {},
      getEventId: (value) => value.id,
      runIdempotent,
      resolveEventChoiceFlow,
      finishEventFlow,
      refreshGoldBar: vi.fn(),
      resolveEvent: vi.fn(),
    });

    expect(result).toBe('resolved');
    expect(runIdempotent).toHaveBeenCalledWith('event:resolve:evt-2:1', expect.any(Function), { ttlMs: 800 });
    expect(resolveEventChoiceFlow).toHaveBeenCalledTimes(1);
    const { onFinish } = resolveEventChoiceFlow.mock.calls[0][1];
    onFinish();
    expect(clearCurrentEvent).toHaveBeenCalledTimes(1);
  });

  it('returns early when the non-persistent event is locked', () => {
    const resolveEventSession = createResolveEventSessionUseCase();
    const runIdempotent = vi.fn();

    const result = resolveEventSession({
      choiceIdx: 0,
      gs: { _eventLock: true },
      event: { id: 'locked', persistent: false },
      getEventId: (value) => value.id,
      runIdempotent,
    });

    expect(result).toBeUndefined();
    expect(runIdempotent).not.toHaveBeenCalled();
  });
});
