import * as Deps from '../../../core/deps_factory.js';

const RUN_CANVAS_DEP_CONTRACTS = Object.freeze({
  getRunNodeHandoffDeps: 'runNodeHandoff',
  getWorldCanvasDeps: 'worldCanvas',
});

function getOptionalFactoryExport(exportName) {
  return Object.prototype.hasOwnProperty.call(Deps, exportName)
    ? Deps[exportName]
    : null;
}

function buildRunCanvasDepAccessors() {
  const createDepsAccessors = getOptionalFactoryExport('createDepsAccessors');
  const createDeps = getOptionalFactoryExport('createDeps');

  if (typeof createDepsAccessors === 'function' && typeof createDeps === 'function') {
    return createDepsAccessors(RUN_CANVAS_DEP_CONTRACTS, createDeps);
  }

  const accessors = {};

  for (const accessorName of Object.keys(RUN_CANVAS_DEP_CONTRACTS)) {
    accessors[accessorName] = (overrides = {}) => ({
      ...(Deps[accessorName]?.() || {}),
      ...overrides,
    });
  }

  return Object.freeze(accessors);
}

function buildCanvasDeps(game, options = {}, extra = {}) {
  const deps = game?.getCanvasDeps?.() || {};
  const doc = options.doc || deps.doc || null;
  const win = options.win || deps.win || doc?.defaultView || null;
  return { ...deps, doc, win, ...extra };
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
  const depAccessors = buildRunCanvasDepAccessors();

  return {
    doc,
    win,
    requestAnimationFrame,
    getCanvasDeps: (extra = {}) => buildCanvasDeps(modules.GAME, { doc, win }, extra),
    ...depAccessors,
  };
}
