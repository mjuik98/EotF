import { DATA } from './public_data_runtime_capabilities.js';
import { getRunCurseLabel as getRunCurseLabelFromCatalog } from '../domain/run_rules_curses.js';

export function getRunCurseLabel(curseId = 'none') {
  return getRunCurseLabelFromCatalog(curseId);
}

export function getRunCardLabel(cardId = '') {
  return DATA?.cards?.[cardId]?.name || '';
}

export function getRunRelicLabel(relicId = '') {
  return DATA?.items?.[relicId]?.name || '';
}
