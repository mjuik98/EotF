export function buildLegacySurfaceSystemGlobals(modules) {
  return {
    RunRules: modules.RunRules,
    getRegionData: modules.getRegionData,
    getBaseRegionIndex: modules.getBaseRegionIndex,
    getRegionCount: modules.getRegionCount,
    ClassMechanics: modules.ClassMechanics,
    SetBonusSystem: modules.SetBonusSystem,
    SaveSystem: modules.SaveSystem,
    CardCostUtils: modules.CardCostUtils,
    DescriptionUtils: modules.DescriptionUtils,
    classMechanics: modules.ClassMechanics,
  };
}
