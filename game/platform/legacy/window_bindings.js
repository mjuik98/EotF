import { buildLegacyWindowBindingSteps } from './build_legacy_window_binding_steps.js';
import { executeLegacyWindowBindingSteps } from './execute_legacy_window_binding_steps.js';
import { resolveLegacyWindowBindingRoot } from './resolve_legacy_window_binding_root.js';

export function attachLegacyWindowBindings(modules, fns, deps) {
  const root = resolveLegacyWindowBindingRoot(modules);
  if (!root) return;

  executeLegacyWindowBindingSteps(
    { root, modules, fns, deps },
    buildLegacyWindowBindingSteps(),
  );
}
