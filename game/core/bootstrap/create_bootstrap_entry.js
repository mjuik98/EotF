import { createModuleRegistry } from '../bindings/module_registry.js';
import { createBindingSetupContext } from './create_binding_setup_context.js';
import { createBootstrapContext } from './create_bootstrap_context.js';
import { initBootstrapCursor } from './init_bootstrap_cursor.js';

export function createBootstrapEntry(options = {}, { depsFactory } = {}) {
  const { doc, win, deps, modules } = createBootstrapContext(options, {
    depsFactory,
    createModuleRegistry,
  });
  initBootstrapCursor({ modules, doc, win });
  return {
    doc,
    win,
    deps,
    modules,
    fns: createBindingSetupContext(modules, deps).fns,
  };
}
