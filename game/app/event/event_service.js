import { clearCurrentEvent, getCurrentEvent, setCurrentEvent } from './event_session_store.js';
import { createResolveEventSessionUseCase } from './use_cases/resolve_event_session_use_case.js';
import { createShowEventSessionUseCase } from './use_cases/show_event_session_use_case.js';
import { pickRandomEventAction } from '../../features/event/app/event_manager_actions.js';

const showEventSessionUseCase = createShowEventSessionUseCase({ setCurrentEvent });
const resolveEventSessionUseCase = createResolveEventSessionUseCase({ clearCurrentEvent });

export { clearCurrentEvent, getCurrentEvent, setCurrentEvent };

export function triggerRandomEventService({
  gs,
  data,
  pickRandomEvent = pickRandomEventAction,
  showEvent,
}) {
  const picked = pickRandomEvent(gs, data);
  if (picked) showEvent(picked);
  return picked || null;
}

export function showEventService({
  event,
  gs,
  doc,
  clearResolveGuards,
  renderEventShell,
  refreshGoldBar,
  resolveEvent,
}) {
  return showEventSessionUseCase({
    event,
    gs,
    doc,
    clearResolveGuards,
    renderEventShell,
    refreshGoldBar,
    resolveEvent,
  });
}

export function resolveEventService({
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
}) {
  return resolveEventSessionUseCase({
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
  });
}
