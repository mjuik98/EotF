import { registerGameBindings } from '../composition/register_game_bindings.js';
import { initBindingDeps } from './init_binding_deps.js';
import { registerBindingLegacySurface } from './register_binding_legacy_surface.js';

export function registerBootstrapBindings(context) {
  const { modules, fns, deps } = context;
  registerGameBindings(modules, fns);
  registerBindingLegacySurface({ modules, fns, deps });
  initBindingDeps({ modules, fns, deps });
  return fns;
}
