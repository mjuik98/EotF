import { executeBindingLegacySurfaceSteps } from './execute_binding_legacy_surface_steps.js';

export function executeBindingLegacySurfacePayload(payload) {
  executeBindingLegacySurfaceSteps(payload.context, payload.steps);
}
