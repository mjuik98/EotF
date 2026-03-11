import { setCurrentEvent } from '../event_session_store.js';

export function createShowEventSessionUseCase(options = {}) {
  const assignCurrentEvent = options.setCurrentEvent || setCurrentEvent;

  return function showEventSession(input = {}) {
    const {
      event,
      gs,
      doc,
      clearResolveGuards,
      renderEventShell,
      refreshGoldBar,
      resolveEvent,
    } = input;

    if (!event || !gs) return false;

    assignCurrentEvent(event);
    gs._eventLock = false;
    clearResolveGuards?.('event:resolve:');
    renderEventShell?.(event, {
      doc,
      gs,
      refreshGoldBar,
      resolveChoice: resolveEvent,
    });
    return true;
  };
}
