import { registerLegacyBridge } from '../platform/legacy/register_legacy_bridge.js';
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
