function getDoc(deps = {}) {
  return deps.doc || deps.win?.document || null;
}

function getWin(deps = {}) {
  return deps.win || deps.doc?.defaultView || null;
}

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
  const doc = getDoc(deps);
  const win = getWin(deps);
  const schedule = scheduleFn || win?.setTimeout?.bind?.(win) || setTimeout;
  const timer = schedule(() => {
    cleanup?.({ doc, win: deps?.win });
    restart?.();
  }, delayMs);

  session?.timers?.push?.(timer);
  return timer;
}

export function restartHiddenEndingOverlay(deps = {}) {
  const { restart } = resolveEndingActions(deps);
  restart?.();
}
