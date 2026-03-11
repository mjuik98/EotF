import { buildBindingLegacyMetrics } from './build_binding_legacy_metrics.js';
import { buildBindingLegacySurfaceSteps } from './build_binding_legacy_surface_steps.js';

export function buildBindingLegacySurfacePayload({ modules, fns, deps }) {
  return {
    context: {
      modules,
      fns,
      deps,
      metrics: buildBindingLegacyMetrics(),
    },
    steps: buildBindingLegacySurfaceSteps(),
  };
}
