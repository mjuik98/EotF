import { buildLegacySurfaceBindingGlobals } from './legacy_surface_binding_globals.js';
import { buildLegacySurfaceEngineGlobals } from './legacy_surface_engine_globals.js';
import { buildLegacySurfaceSystemGlobals } from './legacy_surface_system_globals.js';
import { buildLegacySurfaceUIGlobals } from './legacy_surface_ui_globals.js';

export function buildLegacySurfaceGlobalGroups({ modules, fns }) {
  return {
    engine: buildLegacySurfaceEngineGlobals(modules),
    system: buildLegacySurfaceSystemGlobals(modules),
    ui: buildLegacySurfaceUIGlobals(modules),
    binding: buildLegacySurfaceBindingGlobals(fns),
  };
}
