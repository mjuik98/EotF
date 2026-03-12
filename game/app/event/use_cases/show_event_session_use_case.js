import { unlockEventFlow } from '../../shared/use_cases/runtime_state_use_case.js';
import { setCurrentEvent } from '../event_session_store.js';

export function createShowEventSessionUseCase(options = {}) {
  const assignCurrentEvent = options.setCurrentEvent || setCurrentEvent;
  const releaseEventLock = options.unlockEventFlow || unlockEventFlow;

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
    releaseEventLock(gs);
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
