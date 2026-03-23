import { describe, expect, it, vi } from 'vitest';

import { createShowEventSessionUseCase } from '../game/features/event/public.js';

describe('show_event_session_use_case', () => {
  it('stores the event session, clears the lock, and renders the shell', () => {
    const setCurrentEvent = vi.fn();
    const showEventSession = createShowEventSessionUseCase({ setCurrentEvent });
    const event = { id: 'evt-1' };
    const gs = { _eventLock: true };
    const doc = { body: {} };
    const clearResolveGuards = vi.fn();
    const renderEventShell = vi.fn();
    const refreshGoldBar = vi.fn();
    const resolveEvent = vi.fn();

    const shown = showEventSession({
      event,
      gs,
      doc,
      clearResolveGuards,
      renderEventShell,
      refreshGoldBar,
      resolveEvent,
    });

    expect(shown).toBe(true);
    expect(setCurrentEvent).toHaveBeenCalledWith(event);
    expect(gs._eventLock).toBe(false);
    expect(clearResolveGuards).toHaveBeenCalledWith('event:resolve:');
    expect(renderEventShell).toHaveBeenCalledWith(event, {
      doc,
      gs,
      refreshGoldBar,
      resolveChoice: resolveEvent,
    });
  });
});
