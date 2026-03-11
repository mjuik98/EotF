import { buildLegacySurfaceGlobals } from './build_legacy_surface_globals.js';

export function registerLegacySurface({ modules, fns }) {
  const {
    GAME,
    GS,
    DATA,
    AudioEngine,
    ParticleSystem,
    FovEngine,
    HelpPauseUI,
    exposeGlobals,
  } = modules;

  GAME.init(GS, DATA, AudioEngine, ParticleSystem);
  exposeGlobals(buildLegacySurfaceGlobals({ modules, fns }));
}
