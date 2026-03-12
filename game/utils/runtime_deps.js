function getHostObject() {
  try {
    return Function('return this')();
  } catch {
    return globalThis;
  }
}

export function getDoc(deps = {}) {
  if (deps?.doc) return deps.doc;
  if (typeof document === 'undefined') return null;
  return document;
}

export function getWin(deps = {}) {
  if (deps?.win) return deps.win;
  if (typeof window === 'undefined') return null;
  return window;
}

export function getAudioEngine(deps = {}) {
  return deps?.audioEngine || getWin(deps)?.AudioEngine || null;
}

export function getRaf(deps = {}) {
  if (typeof deps?.requestAnimationFrame === 'function') {
    return deps.requestAnimationFrame;
  }

  const win = getWin(deps);
  if (win && typeof win.requestAnimationFrame === 'function') {
    return win.requestAnimationFrame.bind(win);
  }

  return null;
}

export function getHudUpdateDeps(deps = {}) {
  if (typeof deps?.getHudUpdateDeps === 'function') {
    return deps.getHudUpdateDeps();
  }

  const host = getHostObject();
  return host?.__ECHO_DEPS_FACTORY__?.getHudUpdateDeps?.() || {};
}
