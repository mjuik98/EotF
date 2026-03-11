import * as Deps from './deps_factory.js';
import { createBindingSetupContext } from './bootstrap/create_binding_setup_context.js';
import { executeBindingSetupSequence } from './bootstrap/execute_binding_setup_sequence.js';
import { initBindingDeps } from './bootstrap/init_binding_deps.js';
import { registerBindingLegacySurface } from './bootstrap/register_binding_legacy_surface.js';
import { registerGameBindings } from './composition/register_game_bindings.js';

export function setupBindings(modules) {
  const context = createBindingSetupContext(modules, Deps);

  return executeBindingSetupSequence(context, [
    ({ modules: currentModules, fns }) => {
      registerGameBindings(currentModules, fns);
    },
    ({ modules: currentModules, fns, deps }) => {
      registerBindingLegacySurface({ modules: currentModules, fns, deps });
    },
    ({ modules: currentModules, fns, deps }) => {
      initBindingDeps({ modules: currentModules, fns, deps });
    },
  ]);
}
