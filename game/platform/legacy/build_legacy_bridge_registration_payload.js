import { buildLegacyBridgeInitArgs } from './build_legacy_bridge_init_args.js';
import { buildLegacySurfaceGlobals } from '../../core/bootstrap/build_legacy_surface_globals.js';

export function buildLegacyBridgeRegistrationPayload({ modules, fns }) {
  return {
    initArgs: buildLegacyBridgeInitArgs({ modules }),
    globals: buildLegacySurfaceGlobals({ modules, fns }),
  };
}
