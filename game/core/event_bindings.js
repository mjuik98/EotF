import * as Deps from './deps_factory.js';
import { initBindingDeps } from './bootstrap/init_binding_deps.js';
import { registerBindingLegacySurface } from './bootstrap/register_binding_legacy_surface.js';
import { registerGameBindings } from './composition/register_game_bindings.js';

let M = {};

export function setupBindings(modules) {
    M = modules;

    const fns = {};

    registerGameBindings(M, fns);
    registerBindingLegacySurface({ modules: M, fns, deps: Deps });
    initBindingDeps({ modules: M, fns, deps: Deps });

    return fns;
}
