import { buildLegacySurfaceRegistrationPayload } from './build_legacy_surface_registration_payload.js';
import { executeLegacySurfaceRegistration } from './execute_legacy_surface_registration.js';

export function registerLegacySurface({ modules, fns }) {
  executeLegacySurfaceRegistration({
    modules,
    payload: buildLegacySurfaceRegistrationPayload({ modules, fns }),
  });
}
