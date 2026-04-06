export function resolveHostObject() {
  if (typeof globalThis !== 'undefined') {
    return globalThis;
  }

  try {
    return Function('return this')();
  } catch {
    return null;
  }
}

export function resolveBrowserDocument({ doc = null, win = null } = {}) {
  if (doc) return doc;
  if (win?.document) return win.document;
  if (typeof document !== 'undefined') return document;
  return resolveHostObject()?.document || null;
}

export function resolveBrowserWindow({ doc = null, win = null } = {}) {
  if (win) return win;
  if (doc?.defaultView) return doc.defaultView;
  if (typeof window !== 'undefined') return window;
  return resolveHostObject()?.window || null;
}

export function resolveBrowserRuntime(options = {}) {
  const doc = resolveBrowserDocument(options);
  const win = resolveBrowserWindow({ ...options, doc });

  return { doc, win };
}

export function resolveRequestAnimationFrame(options = {}) {
  if (typeof options?.requestAnimationFrame === 'function') {
    return options.requestAnimationFrame;
  }

  const { win } = resolveBrowserRuntime(options);
  if (typeof win?.requestAnimationFrame === 'function') {
    return win.requestAnimationFrame.bind(win);
  }

  return (cb) => setTimeout(cb, 16);
}

export function resolveDepsFactory(host = null) {
  return (host || resolveHostObject())?.__ECHO_DEPS_FACTORY__ || null;
}
