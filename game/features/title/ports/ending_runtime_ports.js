import { getDoc as getRuntimeDoc, getWin as getRuntimeWin } from '../../../platform/browser/dom/public.js';

export function getEndingDoc(deps = {}) {
  if (typeof deps.getEndingDoc === 'function') return deps.getEndingDoc(deps);
  return getRuntimeDoc(deps);
}

export function getEndingWin(deps = {}) {
  if (typeof deps.getEndingWin === 'function') return deps.getEndingWin(deps);
  return getRuntimeWin(deps);
}

export function resolveEndingRestartSchedule(deps = {}, scheduleFn = null) {
  if (typeof scheduleFn === 'function') return scheduleFn;
  if (typeof deps.scheduleEndingRestart === 'function') return deps.scheduleEndingRestart;

  const win = getEndingWin(deps);
  return win?.setTimeout?.bind?.(win) || setTimeout;
}
