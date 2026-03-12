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
