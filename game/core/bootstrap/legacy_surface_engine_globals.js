export function buildLegacySurfaceEngineGlobals(modules) {
  return {
    AudioEngine: modules.AudioEngine,
    ParticleSystem: modules.ParticleSystem,
    ScreenShake: modules.ScreenShake,
    HitStop: modules.HitStop,
    FovEngine: modules.FovEngine,
    DifficultyScaler: modules.DifficultyScaler,
    RandomUtils: modules.RandomUtils,
  };
}
