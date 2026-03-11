import { buildBindingLegacyMetrics } from './build_binding_legacy_metrics.js';
import { buildBindingLegacySurfaceSteps } from './build_binding_legacy_surface_steps.js';
import { executeBindingLegacySurfaceSteps } from './execute_binding_legacy_surface_steps.js';

export function registerBindingLegacySurface({ modules, fns, deps }) {
  executeBindingLegacySurfaceSteps(
    { modules, fns, deps, metrics: buildBindingLegacyMetrics() },
    buildBindingLegacySurfaceSteps(),
  );
}
