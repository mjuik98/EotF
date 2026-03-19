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

export function publishLegacyModuleBag(modules, moduleBag) {
  if (!modules || !moduleBag) return moduleBag;

  Object.assign(modules, moduleBag);

  if (typeof modules.GAME?.register === 'function') {
    for (const [name, moduleObj] of Object.entries(moduleBag)) {
      modules.GAME.register(name, moduleObj);
    }
  }

  return moduleBag;
}

export function registerLegacyModule(modules, registryName, moduleObj, options = {}) {
  if (!modules || !registryName) return moduleObj;

  const { assignKey = registryName } = options;
  if (assignKey) modules[assignKey] = moduleObj;
  modules.GAME?.register?.(registryName, moduleObj);
  return moduleObj;
}

export function registerLegacyGameModules(modules) {
  LEGACY_GAME_MODULE_REGISTRY_NAMES.forEach((name) => {
    modules.GAME?.register?.(name, modules[name]);
  });
}
