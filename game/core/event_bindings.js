import * as Deps from './deps_factory.js';
import { buildBindingSetupSteps } from './bootstrap/build_binding_setup_steps.js';
import { createBindingSetupContext } from './bootstrap/create_binding_setup_context.js';
import { executeBindingSetupSequence } from './bootstrap/execute_binding_setup_sequence.js';

export function setupBindings(modules) {
  const context = createBindingSetupContext(modules, Deps);
  return executeBindingSetupSequence(context, buildBindingSetupSteps());
}
