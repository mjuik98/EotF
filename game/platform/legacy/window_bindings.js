import { buildLegacyWindowBindingPayload } from './build_legacy_window_binding_payload.js';
import { executeLegacyWindowBindingSteps } from './execute_legacy_window_binding_steps.js';

export function attachLegacyWindowBindings(modules, fns, deps) {
  const payload = buildLegacyWindowBindingPayload({ modules, fns, deps });
  if (!payload) return;

  executeLegacyWindowBindingSteps(payload.context, payload.steps);
}
