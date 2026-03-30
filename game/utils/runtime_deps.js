export function getHostObject() {
  if (typeof globalThis !== 'undefined') {
    return globalThis;
  }
  try {
    return Function('return this')();
  } catch {
    return null;
  }
}

export function getDoc(deps = {}) {
  if (deps?.doc) return deps.doc;
  if (deps?.win?.document) return deps.win.document;
  if (typeof document !== 'undefined') return document;
  return getWin(deps)?.document || null;
}

export function getWin(deps = {}) {
  if (deps?.win) return deps.win;
  if (deps?.doc?.defaultView) return deps.doc.defaultView;
  const host = getHostObject();
  return host?.window || host || null;
}

export function getAudioEngine(deps = {}) {
  return deps?.audioEngine || deps?.win?.AudioEngine || null;
}

export function getRaf(deps = {}) {
  if (typeof deps?.requestAnimationFrame === 'function') {
    return deps.requestAnimationFrame;
  }

  const win = deps?.win || null;
  if (win && typeof win.requestAnimationFrame === 'function') {
    return win.requestAnimationFrame.bind(win);
  }

  return null;
}

export function getSetTimeout(deps = {}) {
  if (typeof deps?.setTimeoutFn === 'function') {
    return deps.setTimeoutFn;
  }

  if (typeof deps?.setTimeout === 'function') {
    return deps.setTimeout;
  }

  const win = deps?.win || null;
  if (win && typeof win.setTimeout === 'function') {
    return win.setTimeout.bind(win);
  }

  return setTimeout;
}

export function getHudUpdateDeps(deps = {}) {
  if (typeof deps?.getHudUpdateDeps === 'function') {
    return deps.getHudUpdateDeps();
  }

  const host = getHostObject();
  return host?.__ECHO_DEPS_FACTORY__?.getHudUpdateDeps?.() || {};
}
