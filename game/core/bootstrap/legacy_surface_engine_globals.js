import { resolveLegacySurfaceModuleRef } from './resolve_legacy_surface_module_refs.js';

export function buildLegacySurfaceEngineGlobals(modules = {}) {
  return {
    AudioEngine: resolveLegacySurfaceModuleRef(modules, 'core', 'AudioEngine'),
    ParticleSystem: resolveLegacySurfaceModuleRef(modules, 'core', 'ParticleSystem'),
    ScreenShake: resolveLegacySurfaceModuleRef(modules, 'core', 'ScreenShake'),
    HitStop: resolveLegacySurfaceModuleRef(modules, 'core', 'HitStop'),
    FovEngine: resolveLegacySurfaceModuleRef(modules, 'core', 'FovEngine'),
    DifficultyScaler: resolveLegacySurfaceModuleRef(modules, 'core', 'DifficultyScaler'),
    RandomUtils: resolveLegacySurfaceModuleRef(modules, 'core', 'RandomUtils'),
  };
}
