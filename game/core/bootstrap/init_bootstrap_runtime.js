import { bootRuntimeFeatures } from './boot_runtime_features.js';
import { registerLegacySurface } from './register_legacy_surface.js';

export function initBootstrapRuntime(context) {
  const { modules, fns, deps, doc, win } = context;
  registerLegacySurface({ modules, fns });
  return bootRuntimeFeatures({
    modules,
    fns,
    deps,
    doc,
    win,
  });
}
