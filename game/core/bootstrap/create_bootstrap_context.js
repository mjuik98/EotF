import { resolveBrowserRuntime } from '../runtime_environment.js';

export function createBootstrapContext(
  options = {},
  { depsFactory, createModuleRegistry },
) {
  const { doc, win } = resolveBrowserRuntime(options);
  return {
    doc,
    win,
    deps: options.deps || depsFactory,
    modules: createModuleRegistry(),
  };
}
