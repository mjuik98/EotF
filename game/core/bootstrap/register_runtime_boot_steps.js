import { buildRuntimeBootBindings } from './build_runtime_boot_bindings.js';
import { executeRuntimeBootSequence } from './execute_runtime_boot_sequence.js';

export function registerRuntimeBootSteps({ modules, fns, deps, doc, win }) {
  return executeRuntimeBootSequence(buildRuntimeBootBindings({ modules, fns, deps, doc, win }));
}
