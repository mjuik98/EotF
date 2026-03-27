import { isEventFlowLocked } from '../state/event_runtime_flow_ports.js';

export function createResolveEventSessionUseCase(options = {}) {
  const clearEventSession = options.clearCurrentEvent;
  const isLocked = options.isEventFlowLocked || isEventFlowLocked;

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
      flowUi,
      refreshGoldBar,
      resolveEvent,
    } = input;

    if (!gs || !event) return undefined;
    if (!event.persistent && isLocked(gs)) return undefined;

    const guardKey = `event:resolve:${getEventId(event)}:${choiceIdx}`;
    return runIdempotent(
      guardKey,
      () => resolveEventChoiceFlow(choiceIdx, {
        gs,
        event,
        doc,
        audioEngine,
        deps,
        flowUi,
        onResolveChoice: resolveEvent,
        onFinish: () => finishEventFlow(doc, gs, { ...deps, flowUi }, clearEventSession),
        onRefreshGoldBar: refreshGoldBar,
      }),
      { ttlMs: 800 },
    );
  };
}
