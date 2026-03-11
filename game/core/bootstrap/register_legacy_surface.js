import { buildLegacySurfaceBindingGlobals } from './legacy_surface_binding_globals.js';
import { buildLegacySurfaceEngineGlobals } from './legacy_surface_engine_globals.js';
import { buildLegacySurfaceSystemGlobals } from './legacy_surface_system_globals.js';
import { buildLegacySurfaceUIGlobals } from './legacy_surface_ui_globals.js';

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

  exposeGlobals({
    ...buildLegacySurfaceEngineGlobals({
      AudioEngine,
      ParticleSystem,
      FovEngine,
      ...modules,
    }),
    ...buildLegacySurfaceSystemGlobals(modules),
    ...buildLegacySurfaceUIGlobals({
      HelpPauseUI,
      ...modules,
    }),
    ...buildLegacySurfaceBindingGlobals(fns),
  });
}
