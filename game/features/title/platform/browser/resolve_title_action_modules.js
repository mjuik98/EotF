function resolveScopedRuntimeModule(modules = {}, key, scopeNames = []) {
  for (const scopeName of scopeNames) {
    const scopedRefs = modules?.featureScopes?.[scopeName] || {};
    if (scopedRefs[key] !== undefined) {
      return scopedRefs[key];
    }
  }

  if (modules?.legacyModules?.[key] !== undefined) {
    return modules.legacyModules[key];
  }

  if (modules?.[key] !== undefined) {
    return modules[key];
  }

  return undefined;
}

export function resolveTitleActionModules(modules = {}) {
  return {
    ...modules,
    GS: resolveScopedRuntimeModule(modules, 'GS', ['core']),
    DATA: resolveScopedRuntimeModule(modules, 'DATA', ['core']),
    AudioEngine: resolveScopedRuntimeModule(modules, 'AudioEngine', ['core']),
    SaveSystem: resolveScopedRuntimeModule(modules, 'SaveSystem', ['core']),
    GameInit: resolveScopedRuntimeModule(modules, 'GameInit', ['core']),
    RandomUtils: resolveScopedRuntimeModule(modules, 'RandomUtils', ['core']),
    CharacterSelectUI: resolveScopedRuntimeModule(modules, 'CharacterSelectUI', ['title']),
    ClassSelectUI: resolveScopedRuntimeModule(modules, 'ClassSelectUI', ['title']),
    MetaProgressionUI: resolveScopedRuntimeModule(modules, 'MetaProgressionUI', ['screen', 'title']),
    HelpPauseUI: resolveScopedRuntimeModule(modules, 'HelpPauseUI', ['title', 'screen']),
    RunSetupUI: resolveScopedRuntimeModule(modules, 'RunSetupUI', ['run']),
    RunModeUI: resolveScopedRuntimeModule(modules, 'RunModeUI', ['run']),
    RegionTransitionUI: resolveScopedRuntimeModule(modules, 'RegionTransitionUI', ['run']),
    SettingsUI: resolveScopedRuntimeModule(modules, 'SettingsUI', ['screen']),
    CodexUI: resolveScopedRuntimeModule(modules, 'CodexUI', ['codex', 'screen']),
  };
}
