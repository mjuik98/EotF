import { buildLegacyWindowBindingSteps } from './build_legacy_window_binding_steps.js';
import { resolveLegacyWindowBindingRoot } from './resolve_legacy_window_binding_root.js';

export function buildLegacyWindowBindingPayload({ modules, fns, deps } = {}) {
  const root = resolveLegacyWindowBindingRoot(modules);
  if (!root) return null;

  return {
    context: { root, modules, fns, deps },
    steps: buildLegacyWindowBindingSteps(),
  };
}
