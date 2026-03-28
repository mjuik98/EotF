import { resolveLegacySurfaceModuleRef } from './resolve_legacy_surface_module_refs.js';

export function buildLegacySurfaceUIGlobals(modules = {}) {
  return {
    CodexUI: resolveLegacySurfaceModuleRef(modules, 'codex', 'CodexUI'),
    EventUI: resolveLegacySurfaceModuleRef(modules, 'event', 'EventUI'),
    CombatUI: resolveLegacySurfaceModuleRef(modules, 'combat', 'CombatUI'),
    DeckModalUI: resolveLegacySurfaceModuleRef(modules, 'combat', 'DeckModalUI'),
    RunModeUI: resolveLegacySurfaceModuleRef(modules, 'run', 'RunModeUI'),
    ScreenUI: resolveLegacySurfaceModuleRef(modules, 'screen', 'ScreenUI'),
    TitleCanvasUI: resolveLegacySurfaceModuleRef(modules, 'title', 'TitleCanvasUI'),
    ClassSelectUI: resolveLegacySurfaceModuleRef(modules, 'title', 'ClassSelectUI'),
    CombatHudUI: resolveLegacySurfaceModuleRef(modules, 'combat', 'CombatHudUI'),
    HudUpdateUI: resolveLegacySurfaceModuleRef(modules, 'combat', 'HudUpdateUI'),
    StatusEffectsUI: resolveLegacySurfaceModuleRef(modules, 'combat', 'StatusEffectsUI'),
    RewardUI: resolveLegacySurfaceModuleRef(modules, 'reward', 'RewardUI'),
    CombatActionsUI: resolveLegacySurfaceModuleRef(modules, 'combat', 'CombatActionsUI'),
    TooltipUI: resolveLegacySurfaceModuleRef(modules, 'combat', 'TooltipUI'),
    HelpPauseUI: resolveLegacySurfaceModuleRef(modules, 'screen', 'HelpPauseUI'),
    RunSetupUI: resolveLegacySurfaceModuleRef(modules, 'run', 'RunSetupUI'),
  };
}
