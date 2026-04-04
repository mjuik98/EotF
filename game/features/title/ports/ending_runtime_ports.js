import {
  getTitleDoc,
  getTitleSetTimeout,
  getTitleWin,
} from './title_runtime_ports.js';

export function getEndingDoc(deps = {}) {
  if (typeof deps.getEndingDoc === 'function') return deps.getEndingDoc(deps);
  return getTitleDoc(deps);
}

export function getEndingWin(deps = {}) {
  if (typeof deps.getEndingWin === 'function') return deps.getEndingWin(deps);
  return getTitleWin(deps);
}

export function resolveEndingRestartSchedule(deps = {}, scheduleFn = null) {
  if (typeof scheduleFn === 'function') return scheduleFn;
  if (typeof deps.scheduleEndingRestart === 'function') return deps.scheduleEndingRestart;

  const win = getEndingWin(deps);
  return getTitleSetTimeout({ ...deps, win });
}
