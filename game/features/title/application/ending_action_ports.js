import {
  getEndingDoc,
  getEndingWin,
  resolveEndingRestartSchedule,
} from '../ports/ending_runtime_ports.js';

export function resolveEndingActions(deps = {}) {
  const endingActions = deps.endingActions || {};

  return {
    restart: endingActions.restart
      || deps.restartEndingFlow
      || deps.restartFromEnding,
    selectFragment: endingActions.selectFragment
      || deps.selectEndingFragment
      || deps.selectFragment,
    openCodex: endingActions.openCodex
      || deps.openEndingCodex
      || deps.openCodex,
  };
}

export function scheduleEndingRestartAction(
  deps = {},
  {
    cleanup,
    delayMs = 420,
    session = null,
    scheduleFn = null,
  } = {},
) {
  const { restart } = resolveEndingActions(deps);
  const doc = getEndingDoc(deps);
  const win = getEndingWin(deps);
  const schedule = resolveEndingRestartSchedule(deps, scheduleFn);
  const timer = schedule(() => {
    cleanup?.({ doc, win });
    restart?.();
  }, delayMs);

  session?.timers?.push?.(timer);
  return timer;
}

export function restartHiddenEndingOverlay(deps = {}) {
  const { restart } = resolveEndingActions(deps);
  restart?.();
}
