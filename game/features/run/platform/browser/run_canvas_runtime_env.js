export function resolveRunCanvasRuntime(options = {}) {
  const doc = options.doc || options.win?.document || (typeof document !== 'undefined' ? document : null);
  const win = options.win || doc?.defaultView || (typeof window !== 'undefined' ? window : null);
  const requestAnimationFrame =
    options.requestAnimationFrame
    || win?.requestAnimationFrame?.bind?.(win)
    || ((cb) => setTimeout(cb, 16));

  return { doc, win, requestAnimationFrame };
}
