function getDoc(deps) {
  return deps?.doc || deps?.win?.document || null;
}

function bindBrowserFn(fn, context) {
  if (typeof fn !== 'function') return null;
  if (typeof fn.bind !== 'function') return fn;
  return fn.bind(context);
}

function getWin(deps, doc) {
  return deps?.win || doc?.defaultView || null;
}

export function resolveCharacterSelectRuntimeEnv(deps = {}) {
  const doc = getDoc(deps);
  const win = getWin(deps, doc);

  return {
    doc,
    win,
    requestAnimationFrameImpl: deps?.requestAnimationFrame || bindBrowserFn(win?.requestAnimationFrame, win),
    cancelAnimationFrameImpl: deps?.cancelAnimationFrame || bindBrowserFn(win?.cancelAnimationFrame, win),
    setTimeoutImpl: deps?.setTimeout || bindBrowserFn(win?.setTimeout, win) || setTimeout,
    clearIntervalImpl: deps?.clearInterval || bindBrowserFn(win?.clearInterval, win) || clearInterval,
  };
}
