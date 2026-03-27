export function resolveBrowserDocument(doc) {
  if (doc) return doc;
  return typeof document !== 'undefined' ? document : null;
}

export function resolveBrowserWindow(win) {
  if (win) return win;
  return typeof window !== 'undefined' ? window : null;
}

export function resolveBrowserRuntime({ doc = null, win = null } = {}) {
  return {
    doc: resolveBrowserDocument(doc),
    win: resolveBrowserWindow(win),
  };
}
