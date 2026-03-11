import { registerRuntimeDebugHooks } from './register_runtime_debug_hooks.js';
import { registerRuntimeBootSteps } from './register_runtime_boot_steps.js';
import { registerRuntimeSubscribers } from './register_runtime_subscribers.js';

export function bootRuntimeFeatures({ modules, fns, deps, doc, win }) {
  registerRuntimeSubscribers({ modules, fns, doc, win });

  registerRuntimeDebugHooks({
    modules,
    fns,
    doc,
    win,
  });

  return registerRuntimeBootSteps({ modules, fns, deps, doc, win });
}
