function getHostObject() {
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
  return getHostObject()?.document || null;
}

export function getHudUpdateDeps(deps = {}) {
  if (typeof deps?.getHudUpdateDeps === 'function') {
    return deps.getHudUpdateDeps();
  }

  const host = getHostObject();
  return host?.__ECHO_DEPS_FACTORY__?.getHudUpdateDeps?.() || {};
}
