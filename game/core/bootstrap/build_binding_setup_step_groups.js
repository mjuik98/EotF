import { initBindingDeps } from './init_binding_deps.js';
import { registerBindingLegacySurface } from './register_binding_legacy_surface.js';
import { registerGameBindings } from '../composition/register_game_bindings.js';

export function buildBindingSetupStepGroups() {
  return {
    gameplay: [
      ({ modules, fns }) => {
        registerGameBindings(modules, fns);
      },
    ],
    bootstrap: [
      ({ modules, fns, deps }) => {
        registerBindingLegacySurface({ modules, fns, deps });
      },
      ({ modules, fns, deps }) => {
        initBindingDeps({ modules, fns, deps });
      },
    ],
  };
}
