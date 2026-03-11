export function buildLegacyGameAPIModuleQueries(modules) {
  return {
    AudioEngine: modules.AudioEngine,
    ParticleSystem: modules.ParticleSystem,
    ScreenShake: modules.ScreenShake,
    HitStop: modules.HitStop,
    FovEngine: modules.FovEngine,
    DifficultyScaler: modules.DifficultyScaler,
    RandomUtils: modules.RandomUtils,
    RunRules: modules.RunRules,
    getRegionData: modules.getRegionData,
    getBaseRegionIndex: modules.getBaseRegionIndex,
    getRegionCount: modules.getRegionCount,
    ClassMechanics: modules.ClassMechanics,
    SetBonusSystem: modules.SetBonusSystem,
    SaveSystem: modules.SaveSystem,
    CardCostUtils: modules.CardCostUtils,
    SettingsUI: modules.SettingsUI,
  };
}
