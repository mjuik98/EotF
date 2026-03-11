import { getAudioEngine as resolveAudioEngine } from '../../../utils/runtime_deps.js';

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

export function updateEventGoldBarUi(doc, player) {
  if (!player) return;
  const gEl = doc.getElementById('eventGoldDisplay');
  const hEl = doc.getElementById('eventHpDisplay');
  const dEl = doc.getElementById('eventDeckDisplay');
  if (gEl) gEl.textContent = player.gold ?? 0;
  if (hEl) hEl.textContent = `${Math.max(0, player.hp ?? 0)}/${player.maxHp ?? 0}`;
  if (dEl) {
    const totalCards = (player.deck?.length || 0) + (player.hand?.length || 0) + (player.graveyard?.length || 0);
    dEl.textContent = totalCards;
  }
}
