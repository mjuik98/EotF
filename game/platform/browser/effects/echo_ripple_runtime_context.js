export function getEchoRippleDoc(deps = {}) {
  if (deps?.doc) return deps.doc;
  if (typeof document === 'undefined') return null;
  return document;
}

export function getEchoRippleWin(deps = {}) {
  if (deps?.win) return deps.win;
  if (typeof window === 'undefined') return null;
  return window;
}

export function getEchoRippleRaf(deps = {}, win = null) {
  if (typeof deps?.requestAnimationFrame === 'function') return deps.requestAnimationFrame;
  if (win && typeof win.requestAnimationFrame === 'function') {
    return win.requestAnimationFrame.bind(win);
  }
  if (typeof requestAnimationFrame === 'function') return requestAnimationFrame.bind(globalThis);
  return null;
}

export function getEchoRippleCaf(deps = {}, win = null) {
  if (typeof deps?.cancelAnimationFrame === 'function') return deps.cancelAnimationFrame;
  if (win && typeof win.cancelAnimationFrame === 'function') {
    return win.cancelAnimationFrame.bind(win);
  }
  if (typeof cancelAnimationFrame === 'function') return cancelAnimationFrame.bind(globalThis);
  return null;
}

export function resizeEchoRippleCanvas(canvas, win) {
  if (!canvas || !win) return;
  canvas.width = win.innerWidth;
  canvas.height = win.innerHeight;
}
