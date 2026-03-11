import { setupBindings } from './event_bindings.js';
import * as Deps from './deps_factory.js';
import { createBootstrapContext } from './bootstrap/create_bootstrap_context.js';
import { initBootstrapCursor } from './bootstrap/init_bootstrap_cursor.js';
import { bootGame } from './init_sequence.js';
import { createModuleRegistry } from './bindings/module_registry.js';

export function bootstrapGameApp(options = {}) {
  const { doc, win, deps, modules } = createBootstrapContext(options, {
    depsFactory: Deps,
    createModuleRegistry,
  });

  initBootstrapCursor({ modules, doc, win });

  const fns = setupBindings(modules);
  bootGame(modules, fns, deps);

  return { modules, fns };
}
