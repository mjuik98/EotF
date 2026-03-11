import { buildBindingLegacySurfacePayload } from './build_binding_legacy_surface_payload.js';
import { executeBindingLegacySurfacePayload } from './execute_binding_legacy_surface_payload.js';

export function registerBindingLegacySurface({ modules, fns, deps }) {
  executeBindingLegacySurfacePayload(
    buildBindingLegacySurfacePayload({ modules, fns, deps }),
  );
}
