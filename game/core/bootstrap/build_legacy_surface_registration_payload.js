import { buildLegacySurfaceGlobals } from './build_legacy_surface_globals.js';

export function buildLegacySurfaceRegistrationPayload({ modules, fns }) {
  return {
    initArgs: [
      modules.GS,
      modules.DATA,
      modules.AudioEngine,
      modules.ParticleSystem,
    ],
    globals: buildLegacySurfaceGlobals({ modules, fns }),
  };
}
