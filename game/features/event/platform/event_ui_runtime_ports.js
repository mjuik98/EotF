function getEventRuntimeWin(deps = {}) {
  if (deps?.win) return deps.win;
  if (typeof window === 'undefined') return null;
  return window;
}

export function resolveAudioEngine(deps = {}) {
  return deps?.audioEngine || getEventRuntimeWin(deps)?.AudioEngine || null;
}

export function getRaf(deps = {}) {
  if (typeof deps?.requestAnimationFrame === 'function') {
    return deps.requestAnimationFrame;
  }

  const win = getEventRuntimeWin(deps);
  if (win && typeof win.requestAnimationFrame === 'function') {
    return win.requestAnimationFrame.bind(win);
  }

  return null;
}
