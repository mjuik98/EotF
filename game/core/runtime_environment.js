function normalizeRuntimeOptions(runtime, key) {
  if (runtime && typeof runtime === 'object' && ('doc' in runtime || 'win' in runtime)) {
    return runtime;
  }

  return key === 'win' ? { win: runtime || null } : { doc: runtime || null };
}

export function resolveBrowserDocument(runtime = null) {
  const { doc = null, win = null } = normalizeRuntimeOptions(runtime, 'doc');
  if (doc) return doc;
  if (win?.document) return win.document;
  return typeof document !== 'undefined' ? document : null;
}

export function resolveBrowserWindow(runtime = null) {
  const { doc = null, win = null } = normalizeRuntimeOptions(runtime, 'win');
  if (win) return win;
  if (doc?.defaultView) return doc.defaultView;
  return typeof window !== 'undefined' ? window : null;
}

export function resolveBrowserRuntime({ doc = null, win = null } = {}) {
  return {
    doc: resolveBrowserDocument({ doc, win }),
    win: resolveBrowserWindow({ doc, win }),
  };
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
