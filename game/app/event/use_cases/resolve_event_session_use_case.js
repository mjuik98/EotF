import { clearCurrentEvent } from '../event_session_store.js';

export function createResolveEventSessionUseCase(options = {}) {
  const clearEventSession = options.clearCurrentEvent || clearCurrentEvent;

  return function resolveEventSession(input = {}) {
    const {
      choiceIdx,
      gs,
      event,
      doc,
      deps,
      audioEngine,
      getEventId,
      runIdempotent,
      resolveEventChoiceFlow,
      finishEventFlow,
      refreshGoldBar,
      resolveEvent,
    } = input;

    if (!gs || !event) return undefined;
    if (!event.persistent && gs._eventLock) return undefined;

    const guardKey = `event:resolve:${getEventId(event)}:${choiceIdx}`;
    return runIdempotent(
      guardKey,
      () => resolveEventChoiceFlow(choiceIdx, {
        gs,
        event,
        doc,
        audioEngine,
        deps,
        onResolveChoice: resolveEvent,
        onFinish: () => finishEventFlow(doc, gs, deps, clearEventSession),
        onRefreshGoldBar: refreshGoldBar,
      }),
      { ttlMs: 800 },
    );
  };
}
