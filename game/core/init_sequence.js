import { registerLegacySurface } from './bootstrap/register_legacy_surface.js';
import { bootRuntimeFeatures } from './bootstrap/boot_runtime_features.js';

export function bootGame(modules, fns, Deps) {
    registerLegacySurface({ modules, fns });
    return bootRuntimeFeatures({
      modules,
      fns,
      deps: Deps,
      doc: document,
      win: window,
    });
}
