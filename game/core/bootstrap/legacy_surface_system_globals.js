import { resolveLegacySurfaceModuleRef } from './resolve_legacy_surface_module_refs.js';

export function buildLegacySurfaceSystemGlobals(modules = {}) {
  return {
    RunRules: resolveLegacySurfaceModuleRef(modules, 'core', 'RunRules'),
    getRegionData: resolveLegacySurfaceModuleRef(modules, 'core', 'getRegionData'),
    getBaseRegionIndex: resolveLegacySurfaceModuleRef(modules, 'core', 'getBaseRegionIndex'),
    getRegionCount: resolveLegacySurfaceModuleRef(modules, 'core', 'getRegionCount'),
    ClassMechanics: resolveLegacySurfaceModuleRef(modules, 'combat', 'ClassMechanics'),
    SetBonusSystem: resolveLegacySurfaceModuleRef(modules, 'combat', 'SetBonusSystem'),
    SaveSystem: resolveLegacySurfaceModuleRef(modules, 'core', 'SaveSystem'),
    CardCostUtils: resolveLegacySurfaceModuleRef(modules, 'core', 'CardCostUtils'),
    DescriptionUtils: resolveLegacySurfaceModuleRef(modules, 'core', 'DescriptionUtils'),
    classMechanics: resolveLegacySurfaceModuleRef(modules, 'combat', 'ClassMechanics'),
  };
}
