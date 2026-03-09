import { setupBindings } from './event_bindings.js';
import * as Deps from './deps_factory.js';
import { bootGame } from './init_sequence.js';
import { createModuleRegistry } from './bindings/module_registry.js';
import { CustomCursor } from '../ui/common/custom_cursor.js';

export function bootstrapGameApp(options = {}) {
  const doc = options.doc || document;
  const win = options.win || window;
  const deps = options.deps || Deps;
  const modules = createModuleRegistry();

  try {
    CustomCursor.init({ doc, win });
  } catch (e) {
    console.error('[Main] CustomCursor init failed:', e);
  }

  const fns = setupBindings(modules);
  bootGame(modules, fns, deps);

  return { modules, fns };
}
