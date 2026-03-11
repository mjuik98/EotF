export const LEGACY_GAME_MODULE_REGISTRY_NAMES = [
  'EventUI',
  'CombatUI',
  'HudUpdateUI',
  'StatusEffectsUI',
  'MazeSystem',
  'StoryUI',
  'CodexUI',
  'EndingScreenUI',
  'RunModeUI',
  'MetaProgressionUI',
  'HelpPauseUI',
  'SettingsUI',
  'TooltipUI',
  'FeedbackUI',
  'ScreenUI',
  'RunSetupUI',
  'RunStartUI',
  'ClassMechanics',
  'RunRules',
  'CardCostUtils',
  'GameAPI',
];

export function registerLegacyGameModules(modules) {
  LEGACY_GAME_MODULE_REGISTRY_NAMES.forEach((name) => {
    modules.GAME.register(name, modules[name]);
  });
}
