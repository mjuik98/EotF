import { buildLegacySurfaceBindingGlobals } from './legacy_surface_binding_globals.js';
import { resolveModuleRegistryLegacyCompat } from '../bindings/resolve_module_registry_legacy_compat.js';
import { buildLegacySurfaceEngineGlobals } from './legacy_surface_engine_globals.js';
import { buildLegacySurfaceSystemGlobals } from './legacy_surface_system_globals.js';
import { buildLegacySurfaceUIGlobals } from './legacy_surface_ui_globals.js';

export function buildLegacySurfaceGlobalGroups({ modules, fns }) {
  const legacyModules = resolveModuleRegistryLegacyCompat(modules);
  const { AudioEngine, FovEngine, HelpPauseUI, ParticleSystem } = legacyModules;

  return {
    engine: buildLegacySurfaceEngineGlobals({
      AudioEngine,
      ParticleSystem,
      FovEngine,
      ...legacyModules,
    }),
    system: buildLegacySurfaceSystemGlobals(legacyModules),
    ui: buildLegacySurfaceUIGlobals({
      HelpPauseUI,
      ...legacyModules,
    }),
    binding: buildLegacySurfaceBindingGlobals(fns),
  };
}
