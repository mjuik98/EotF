import {
  resolveLegacyCompatModules,
  resolveLegacyGameRoot,
  resolveLegacyModuleBag,
} from './resolve_legacy_module_bag.js';

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

function defineLegacyModuleAlias(target, legacyModules, key) {
  if (!target || !legacyModules || target === legacyModules || !key) return;
  if (Object.prototype.hasOwnProperty.call(target, key)) return;

  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: false,
    get() {
      return legacyModules[key];
    },
    set(value) {
      legacyModules[key] = value;
    },
  });
}

export function publishLegacyModuleBag(modules, moduleBag) {
  if (!modules || !moduleBag) return moduleBag;
  const legacyModules = resolveLegacyModuleBag(modules);
  const gameRoot = resolveLegacyGameRoot(modules);

  Object.assign(legacyModules, moduleBag);
  if (legacyModules !== modules) {
    for (const key of Object.keys(moduleBag)) {
      defineLegacyModuleAlias(modules, legacyModules, key);
    }
  }

  if (typeof gameRoot?.register === 'function') {
    for (const [name, moduleObj] of Object.entries(moduleBag)) {
      gameRoot.register(name, moduleObj);
    }
  }

  return moduleBag;
}

export function createLegacyModuleBagEnsurer(options = {}) {
  const {
    resolveFromModules = null,
    loadModuleBag,
    publishModuleBag = publishLegacyModuleBag,
    prepareLoadedModuleBag = null,
  } = options;

  let moduleBagPromise = null;

  return async function ensureLegacyModuleBag(modules) {
    const resolvedModuleBag = typeof resolveFromModules === 'function'
      ? resolveFromModules(modules)
      : null;
    if (resolvedModuleBag) return resolvedModuleBag;

    if (!moduleBagPromise) {
      moduleBagPromise = Promise.resolve()
        .then(() => loadModuleBag?.())
        .catch((error) => {
          moduleBagPromise = null;
          throw error;
        });
    }

    const moduleBag = await moduleBagPromise;
    if (typeof prepareLoadedModuleBag === 'function') {
      prepareLoadedModuleBag(modules, moduleBag);
    }
    return publishModuleBag(modules, moduleBag);
  };
}

export function registerLegacyModule(modules, registryName, moduleObj, options = {}) {
  if (!modules || !registryName) return moduleObj;
  const legacyModules = resolveLegacyModuleBag(modules);
  const gameRoot = resolveLegacyGameRoot(modules);

  const { assignKey = registryName } = options;
  if (assignKey) {
    legacyModules[assignKey] = moduleObj;
    if (legacyModules !== modules) defineLegacyModuleAlias(modules, legacyModules, assignKey);
  }
  gameRoot?.register?.(registryName, moduleObj);
  return moduleObj;
}

export function registerLegacyGameModules(modules) {
  const legacyModules = resolveLegacyCompatModules(modules);
  const gameRoot = resolveLegacyGameRoot(modules);

  LEGACY_GAME_MODULE_REGISTRY_NAMES.forEach((name) => {
    gameRoot?.register?.(name, legacyModules[name]);
  });
}
