import * as Deps from './deps_factory.js';
import { createBootstrapEntry } from './bootstrap/create_bootstrap_entry.js';
import { initBootstrapRuntime } from './bootstrap/init_bootstrap_runtime.js';
import { registerBootstrapBindings } from './bootstrap/register_bootstrap_bindings.js';

export function bootstrapGameApp(options = {}) {
  const context = createBootstrapEntry(options, {
    depsFactory: Deps,
  });
  registerBootstrapBindings(context);
  initBootstrapRuntime(context);

  return {
    modules: context.modules,
    fns: context.fns,
  };
}
