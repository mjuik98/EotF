import { initBootstrapRuntime } from './bootstrap/init_bootstrap_runtime.js';
import { resolveBrowserRuntime } from './runtime_environment.js';

export function bootGame(modules, fns, Deps, runtime = {}) {
  const { doc, win } = resolveBrowserRuntime(runtime);
  return initBootstrapRuntime({
    modules,
    fns,
    deps: Deps,
    doc,
    win,
  });
}
