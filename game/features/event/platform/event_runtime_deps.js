import { resolveAudioEngine } from './event_ui_runtime_ports.js';

export function getEventId(event) {
  if (!event || typeof event !== 'object') return 'unknown';
  return event.id || event.key || event.title || 'unknown';
}

export function getDoc(deps) {
  return deps?.doc || document;
}

export function getGS(deps) {
  return deps?.gs;
}

export function getData(deps) {
  return deps?.data;
}

export function getRunRules(deps) {
  return deps?.runRules;
}

export function getAudioEngine(deps) {
  return resolveAudioEngine(deps);
}
