import { initBootstrapRuntime } from './bootstrap/init_bootstrap_runtime.js';

export function bootGame(modules, fns, Deps) {
  return initBootstrapRuntime({
    modules,
    fns,
    deps: Deps,
    doc: document,
    win: window,
  });
}
