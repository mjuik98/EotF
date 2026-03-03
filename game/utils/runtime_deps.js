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
  return deps?.audioEngine || globalThis.AudioEngine;
}

export function getRaf(deps = {}) {
  if (typeof deps?.requestAnimationFrame === 'function') {
    return deps.requestAnimationFrame;
  }

  const win = getWin(deps);
  if (win && typeof win.requestAnimationFrame === 'function') {
    return win.requestAnimationFrame.bind(win);
  }

  if (typeof globalThis.requestAnimationFrame === 'function') {
    return globalThis.requestAnimationFrame.bind(globalThis);
  }

  return null;
}
