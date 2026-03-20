function resolveTopLevelDataPropertyValue(modules, key) {
  if (!modules || !key) return undefined;

  const descriptor = Object.getOwnPropertyDescriptor(modules, key);
  if (!descriptor) return undefined;
  if (typeof descriptor.get === 'function') return undefined;
  return descriptor.value;
}

export function resolveUiRuntimeModule(modules = {}, key, scopeNames = []) {
  for (const scopeName of scopeNames) {
    const scopedRefs = modules?.featureScopes?.[scopeName] || {};
    if (scopedRefs[key] !== undefined) {
      return scopedRefs[key];
    }
  }

  if (modules?.legacyModules?.[key] !== undefined) {
    return modules.legacyModules[key];
  }

  return resolveTopLevelDataPropertyValue(modules, key);
}

export function resolveUiActionModules(modules = {}) {
  return {
    ...modules,
    AudioEngine: resolveUiRuntimeModule(modules, 'AudioEngine', ['core']),
    CodexUI: resolveUiRuntimeModule(modules, 'CodexUI', ['codex', 'screen']),
    CombatHudUI: resolveUiRuntimeModule(modules, 'CombatHudUI', ['combat']),
    CombatInfoUI: resolveUiRuntimeModule(modules, 'CombatInfoUI', ['combat']),
    DeckModalUI: resolveUiRuntimeModule(modules, 'DeckModalUI', ['combat']),
    DescriptionUtils: resolveUiRuntimeModule(modules, 'DescriptionUtils', ['core']),
    DomValueUI: resolveUiRuntimeModule(modules, 'DomValueUI', ['screen', 'combat']),
    GS: resolveUiRuntimeModule(modules, 'GS', ['core']),
    GameInit: resolveUiRuntimeModule(modules, 'GameInit', ['core']),
    HudUpdateUI: resolveUiRuntimeModule(modules, 'HudUpdateUI', ['combat']),
    ScreenUI: resolveUiRuntimeModule(modules, 'ScreenUI', ['screen']),
    SettingsUI: resolveUiRuntimeModule(modules, 'SettingsUI', ['screen']),
    StatusEffectsUI: resolveUiRuntimeModule(modules, 'StatusEffectsUI', ['combat']),
    TooltipUI: resolveUiRuntimeModule(modules, 'TooltipUI', ['screen']),
  };
}
