import { buildLegacySurfaceInitArgs } from './build_legacy_surface_init_args.js';
import { buildLegacySurfaceGlobals } from './build_legacy_surface_globals.js';

export function buildLegacySurfaceRegistrationPayload({ modules, fns }) {
  return {
    initArgs: buildLegacySurfaceInitArgs({ modules }),
    globals: buildLegacySurfaceGlobals({ modules, fns }),
  };
}
