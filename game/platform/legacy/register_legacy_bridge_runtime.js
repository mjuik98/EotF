import { buildLegacyBridgeRegistrationPayload } from './build_legacy_bridge_registration_payload.js';
import { executeLegacySurfaceRegistration } from '../../core/bootstrap/execute_legacy_surface_registration.js';

export function registerLegacyBridgeRuntime({ modules, fns }) {
  executeLegacySurfaceRegistration({
    modules,
    payload: buildLegacyBridgeRegistrationPayload({ modules, fns }),
  });
}
