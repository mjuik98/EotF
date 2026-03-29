import { resolveModuleRegistryValue } from '../../../../core/bindings/module_registry_scopes.js';

export function resolveUiRuntimeModule(modules = {}, key, scopeNames = []) {
  return resolveModuleRegistryValue(modules, key, scopeNames, { topLevelDataOnly: true });
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
    HelpPauseUI: resolveUiRuntimeModule(modules, 'HelpPauseUI', ['screen', 'title']),
    HudUpdateUI: resolveUiRuntimeModule(modules, 'HudUpdateUI', ['combat']),
    ScreenUI: resolveUiRuntimeModule(modules, 'ScreenUI', ['screen']),
    SettingsUI: resolveUiRuntimeModule(modules, 'SettingsUI', ['screen']),
    StatusEffectsUI: resolveUiRuntimeModule(modules, 'StatusEffectsUI', ['combat']),
    TooltipUI: resolveUiRuntimeModule(modules, 'TooltipUI', ['combat', 'screen']),
  };
}
