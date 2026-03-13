import { registerLegacyBridge } from '../../platform/legacy/public.js';
import { bootRuntimeFeatures } from './boot_runtime_features.js';

export function initBootstrapRuntime(context) {
  const { modules, fns, deps, doc, win } = context;
  registerLegacyBridge({ modules, fns });
  return bootRuntimeFeatures({
    modules,
    fns,
    deps,
    doc,
    win,
  });
}
