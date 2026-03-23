import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearCurrentEvent,
  getCurrentEvent,
  resolveEventService,
  showEventService,
  triggerRandomEventService,
} from '../game/features/event/application/event_service.js';

describe('event_service', () => {
  beforeEach(() => {
    clearCurrentEvent();
  });

  it('triggers random event selection and forwards the event to the caller', () => {
    const showEvent = vi.fn();
    const event = { id: 'picked' };

    const picked = triggerRandomEventService({
      gs: { player: {} },
      data: { events: [] },
      pickRandomEvent: vi.fn(() => event),
      showEvent,
    });

    expect(picked).toBe(event);
    expect(showEvent).toHaveBeenCalledWith(event);
  });

  it('stores and renders the current event session', () => {
    const event = { id: 'evt-1' };
    const gs = { _eventLock: true };
    const renderEventShell = vi.fn();

    const shown = showEventService({
      event,
      gs,
      doc: { body: {} },
      clearResolveGuards: vi.fn(),
      renderEventShell,
      refreshGoldBar: vi.fn(),
      resolveEvent: vi.fn(),
    });

    expect(shown).toBe(true);
    expect(getCurrentEvent()).toBe(event);
    expect(gs._eventLock).toBe(false);
    expect(renderEventShell).toHaveBeenCalledTimes(1);
  });

  it('resolves the current event through the idempotent flow and clears session on finish', () => {
    const event = { id: 'evt-2', persistent: false };
    const gs = { _eventLock: false };
    showEventService({
      event,
      gs,
      doc: {},
      clearResolveGuards: vi.fn(),
      renderEventShell: vi.fn(),
      refreshGoldBar: vi.fn(),
      resolveEvent: vi.fn(),
    });

    const finishEventFlow = vi.fn((_doc, _gs, _deps, onDone) => onDone?.());
    const resolveEventChoiceFlow = vi.fn(() => 'resolved');
    const runIdempotent = vi.fn((_key, runner) => runner());

    const result = resolveEventService({
      choiceIdx: 1,
      gs,
      event: getCurrentEvent(),
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
    expect(getCurrentEvent()).toBeNull();
  });
});
