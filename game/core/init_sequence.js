import { registerLegacyBridge } from '../platform/legacy/public.js';
import { bootRuntimeFeatures } from './bootstrap/boot_runtime_features.js';

export function bootGame(modules, fns, Deps) {
    registerLegacyBridge({ modules, fns });
    return bootRuntimeFeatures({
      modules,
      fns,
      deps: Deps,
      doc: document,
      win: window,
    });
}
