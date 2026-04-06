import * as Deps from '../../../core/deps_factory.js';
import { resolveModuleRegistryGameRoot } from '../../../core/bindings/module_registry_scopes.js';
import { resolveRunCanvasRuntime } from '../platform/browser/run_canvas_runtime_env.js';

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
  const { doc, win, requestAnimationFrame } = resolveRunCanvasRuntime(options);
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
