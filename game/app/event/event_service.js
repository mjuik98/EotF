let currentEvent = null;

export function getCurrentEvent() {
  return currentEvent;
}

export function setCurrentEvent(event) {
  currentEvent = event || null;
  return currentEvent;
}

export function clearCurrentEvent() {
  currentEvent = null;
}

export function triggerRandomEventService({
  gs,
  data,
  pickRandomEvent,
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
  if (!event || !gs) return false;

  setCurrentEvent(event);
  gs._eventLock = false;
  clearResolveGuards?.('event:resolve:');
  renderEventShell(event, {
    doc,
    gs,
    refreshGoldBar,
    resolveChoice: resolveEvent,
  });
  return true;
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
  if (!gs || !event) return undefined;
  if (!event.persistent && gs._eventLock) return undefined;

  const guardKey = `event:resolve:${getEventId(event)}:${choiceIdx}`;
  return runIdempotent(guardKey, () => resolveEventChoiceFlow(choiceIdx, {
    gs,
    event,
    doc,
    audioEngine,
    deps,
    onResolveChoice: resolveEvent,
    onFinish: () => finishEventFlow(doc, gs, deps, clearCurrentEvent),
    onRefreshGoldBar: refreshGoldBar,
  }), { ttlMs: 800 });
}
