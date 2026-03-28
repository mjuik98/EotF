import { resolveModuleRegistryValue } from '../../../../core/bindings/module_registry_scopes.js';

export function resolveTitleActionModules(modules = {}) {
  return {
    ...modules,
    GS: resolveModuleRegistryValue(modules, 'GS', ['core']),
    DATA: resolveModuleRegistryValue(modules, 'DATA', ['core']),
    AudioEngine: resolveModuleRegistryValue(modules, 'AudioEngine', ['core']),
    SaveSystem: resolveModuleRegistryValue(modules, 'SaveSystem', ['core']),
    GameInit: resolveModuleRegistryValue(modules, 'GameInit', ['core']),
    RandomUtils: resolveModuleRegistryValue(modules, 'RandomUtils', ['core']),
    CharacterSelectUI: resolveModuleRegistryValue(modules, 'CharacterSelectUI', ['title']),
    ClassSelectUI: resolveModuleRegistryValue(modules, 'ClassSelectUI', ['title']),
    MetaProgressionUI: resolveModuleRegistryValue(modules, 'MetaProgressionUI', ['screen', 'title']),
    HelpPauseUI: resolveModuleRegistryValue(modules, 'HelpPauseUI', ['screen', 'title']),
    RunSetupUI: resolveModuleRegistryValue(modules, 'RunSetupUI', ['run']),
    RunModeUI: resolveModuleRegistryValue(modules, 'RunModeUI', ['run']),
    RegionTransitionUI: resolveModuleRegistryValue(modules, 'RegionTransitionUI', ['run']),
    SettingsUI: resolveModuleRegistryValue(modules, 'SettingsUI', ['screen']),
    CodexUI: resolveModuleRegistryValue(modules, 'CodexUI', ['codex', 'screen']),
  };
}
