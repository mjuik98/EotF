import { unlockEventFlow } from '../state/event_runtime_flow_ports.js';

export function createShowEventSessionUseCase(options = {}) {
  const assignCurrentEvent = options.setCurrentEvent;
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

    assignCurrentEvent?.(event);
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
