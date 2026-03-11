import { buildLegacySurfaceBindingGlobals } from './legacy_surface_binding_globals.js';
import { buildLegacySurfaceEngineGlobals } from './legacy_surface_engine_globals.js';
import { buildLegacySurfaceSystemGlobals } from './legacy_surface_system_globals.js';
import { buildLegacySurfaceUIGlobals } from './legacy_surface_ui_globals.js';

export function buildLegacySurfaceGlobalGroups({ modules, fns }) {
  const { AudioEngine, FovEngine, HelpPauseUI, ParticleSystem } = modules;

  return {
    engine: buildLegacySurfaceEngineGlobals({
      AudioEngine,
      ParticleSystem,
      FovEngine,
      ...modules,
    }),
    system: buildLegacySurfaceSystemGlobals(modules),
    ui: buildLegacySurfaceUIGlobals({
      HelpPauseUI,
      ...modules,
    }),
    binding: buildLegacySurfaceBindingGlobals(fns),
  };
}
