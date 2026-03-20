export function resolveLegacyModuleBag(modules) {
  return modules?.legacyModules || modules || {};
}

const LEGACY_SCOPE_KEY_GROUPS = Object.freeze({
  core: [
    'GAME',
    'GS',
    'DATA',
    'AudioEngine',
    'ParticleSystem',
    'SaveSystem',
    'RunRules',
    'RandomUtils',
    'CardCostUtils',
    'DescriptionUtils',
    'FovEngine',
    'DifficultyScaler',
  ],
  title: [
    'CharacterSelectUI',
    'ClassSelectUI',
    'HelpPauseUI',
    'GameBootUI',
    'TitleCanvasUI',
  ],
  run: [
    'RunModeUI',
    'RunSetupUI',
    'RunStartUI',
    'RegionTransitionUI',
    'MazeSystem',
    'finalizeRunOutcome',
  ],
  combat: [
    'CombatUI',
    'CombatHudUI',
    'HudUpdateUI',
    'StatusEffectsUI',
    'CombatActionsUI',
    'DeckModalUI',
    'ClassMechanics',
    'SetBonusSystem',
  ],
  event: ['EventUI'],
  reward: ['RewardUI'],
  screen: ['ScreenUI', 'TooltipUI', 'SettingsUI'],
  codex: ['CodexUI'],
});

function assignScopeKeys(target, scope, keys) {
  if (!target || !scope) return;
  for (const key of keys) {
    if (scope[key] !== undefined) {
      target[key] = scope[key];
    }
  }
}

function resolveTopLevelDataPropertyValue(modules, key) {
  if (!modules || !key) return undefined;

  const descriptor = Object.getOwnPropertyDescriptor(modules, key);
  if (!descriptor) return undefined;
  if (typeof descriptor.get === 'function') return undefined;
  return descriptor.value;
}

export function resolveLegacyScopeNameForKey(key) {
  if (!key) return null;

  for (const [scopeName, keys] of Object.entries(LEGACY_SCOPE_KEY_GROUPS)) {
    if (keys.includes(key)) return scopeName;
  }

  return null;
}

export function resolveLegacyCompatModules(modules) {
  const legacyModules = resolveLegacyModuleBag(modules);
  const compatModules = {
    ...legacyModules,
  };
  const featureScopes = modules?.featureScopes || {};

  for (const [scopeName, keys] of Object.entries(LEGACY_SCOPE_KEY_GROUPS)) {
    assignScopeKeys(compatModules, featureScopes[scopeName], keys);
  }

  compatModules.GAME = featureScopes.core?.GAME || compatModules.GAME || modules?.GAME || null;
  return compatModules;
}

export function resolveLegacyCompatValue(modules, key) {
  const scopeName = resolveLegacyScopeNameForKey(key);
  const scopedValue = scopeName ? modules?.featureScopes?.[scopeName]?.[key] : undefined;

  if (scopedValue !== undefined) return scopedValue;
  if (modules?.legacyModules?.[key] !== undefined) return modules.legacyModules[key];
  return resolveTopLevelDataPropertyValue(modules, key);
}

export function resolveLegacyGameRoot(modules) {
  return resolveLegacyCompatModules(modules).GAME || null;
}

export function resolveLegacyApiRoot(modules) {
  return resolveLegacyGameRoot(modules)?.API || null;
}
