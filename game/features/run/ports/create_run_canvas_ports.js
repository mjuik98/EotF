import * as Deps from '../../../core/deps_factory.js';

function buildCanvasDeps(game, extra = {}) {
  const deps = game?.getCanvasDeps?.() || {};
  return { ...deps, ...extra };
}

export function createRunCanvasPorts(modules, options = {}) {
  const fallbackDoc = typeof document !== 'undefined' ? document : null;
  const fallbackWin = typeof window !== 'undefined' ? window : null;
  const doc = options.doc || fallbackDoc;
  const win = options.win || fallbackWin;
  const requestAnimationFrame =
    options.requestAnimationFrame
    || win?.requestAnimationFrame?.bind?.(win)
    || ((cb) => setTimeout(cb, 16));

  return {
    doc,
    requestAnimationFrame,
    getCanvasDeps: (extra = {}) => buildCanvasDeps(modules.GAME, extra),
    getWorldCanvasDeps: () => Deps.getWorldCanvasDeps(),
  };
}
