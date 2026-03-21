import * as Deps from '../../../core/deps_factory.js';
import { resolveModuleRegistryGameRoot } from '../../../core/bindings/module_registry_scopes.js';

const RUN_CANVAS_DEP_CONTRACTS = Object.freeze({
  getRunNodeHandoffDeps: 'runNodeHandoff',
  getWorldCanvasDeps: 'worldCanvas',
});

function buildRunCanvasDepAccessors() {
  return Deps.buildFeatureContractAccessors(RUN_CANVAS_DEP_CONTRACTS, Deps);
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
  const game = resolveModuleRegistryGameRoot(modules);

  return {
    doc,
    win,
    requestAnimationFrame,
    getCanvasDeps: (extra = {}) => buildCanvasDeps(game, { doc, win }, extra),
    ...depAccessors,
  };
}
