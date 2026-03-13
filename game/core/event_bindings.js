import * as Deps from './deps_factory.js';
import { createBindingSetupContext } from './bootstrap/create_binding_setup_context.js';
import { registerBootstrapBindings } from './bootstrap/register_bootstrap_bindings.js';

export function setupBindings(modules) {
  const context = createBindingSetupContext(modules, Deps);
  return registerBootstrapBindings(context);
}
