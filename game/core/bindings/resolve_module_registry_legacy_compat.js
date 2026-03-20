const MODULE_REGISTRY_LEGACY_SCOPE_KEYS = Object.freeze({
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
    'HitStop',
    'ScreenShake',
  ],
  title: [
    'CharacterSelectUI',
    'ClassSelectUI',
    'HelpPauseUI',
    'GameBootUI',
    'TitleCanvasUI',
  ],
  combat: [
    'CombatUI',
    'DeckModalUI',
    'CombatHudUI',
    'HudUpdateUI',
    'StatusEffectsUI',
    'CombatActionsUI',
    'ClassMechanics',
    'SetBonusSystem',
  ],
  run: [
    'RunModeUI',
    'RunSetupUI',
    'RunStartUI',
    'MazeSystem',
    'RegionTransitionUI',
    'finalizeRunOutcome',
  ],
  screen: ['ScreenUI', 'TooltipUI', 'SettingsUI'],
  codex: ['CodexUI'],
  event: ['EventUI'],
  reward: ['RewardUI'],
});

function resolveGenericScopedCompatValue(featureScopes, key) {
  const scopeGroups = Object.values(featureScopes || {}).filter(Boolean);

  for (let index = scopeGroups.length - 1; index >= 0; index -= 1) {
    const scope = scopeGroups[index];
    if (scope?.[key] !== undefined) {
      return scope[key];
    }
  }

  return undefined;
}

function resolveGenericScopedCompatScopeName(featureScopes, key) {
  const entries = Object.entries(featureScopes || {}).filter(([, scope]) => scope);

  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const [scopeName, scope] = entries[index];
    if (scope?.[key] !== undefined) {
      return scopeName;
    }
  }

  return null;
}

function resolveTopLevelDataPropertyValue(modules, key) {
  if (!modules || !key) return undefined;

  const descriptor = Object.getOwnPropertyDescriptor(modules, key);
  if (!descriptor) return undefined;
  if (typeof descriptor.get === 'function') return undefined;
  return descriptor.value;
}

export function listModuleRegistryLegacyCompatKeys(featureScopes = {}) {
  const compatKeys = new Set();

  for (const [scopeName, keys] of Object.entries(MODULE_REGISTRY_LEGACY_SCOPE_KEYS)) {
    const scope = featureScopes?.[scopeName];
    if (!scope) continue;

    for (const key of keys) {
      if (scope[key] !== undefined) {
        compatKeys.add(key);
      }
    }
  }

  return [...compatKeys];
}

export function listModuleRegistryScopedKeys(featureScopes = {}) {
  const scopedKeys = new Set();

  for (const scope of Object.values(featureScopes || {})) {
    if (!scope) continue;
    for (const key of Object.keys(scope)) {
      scopedKeys.add(key);
    }
  }

  return [...scopedKeys];
}

function overlayScopeRefs(target, scope, keys) {
  if (!target || !scope) return;
  for (const key of keys) {
    if (scope[key] !== undefined) {
      target[key] = scope[key];
    }
  }
}

export function resolveModuleRegistryScopeNameForKey(key) {
  if (!key) return null;

  for (const [scopeName, keys] of Object.entries(MODULE_REGISTRY_LEGACY_SCOPE_KEYS)) {
    if (keys.includes(key)) return scopeName;
  }

  return null;
}

export function resolveModuleRegistryLegacyCompat(modules) {
  const legacyModules = modules?.legacyModules || modules || {};
  const compatModules = {
    ...legacyModules,
  };
  const featureScopes = modules?.featureScopes || {};

  for (const [scopeName, keys] of Object.entries(MODULE_REGISTRY_LEGACY_SCOPE_KEYS)) {
    overlayScopeRefs(compatModules, featureScopes[scopeName], keys);
  }

  compatModules.GAME = featureScopes.core?.GAME || compatModules.GAME || modules?.GAME || null;
  return compatModules;
}

export function resolveModuleRegistryCompatValue(modules, key) {
  const scopeName = resolveModuleRegistryScopeNameForKey(key);
  const scopedValue = scopeName
    ? modules?.featureScopes?.[scopeName]?.[key]
    : resolveGenericScopedCompatValue(modules?.featureScopes, key);

  if (scopedValue !== undefined) return scopedValue;
  if (modules?.legacyModules?.[key] !== undefined) return modules.legacyModules[key];
  return resolveTopLevelDataPropertyValue(modules, key);
}

export function assignModuleRegistryCompatValue(modules, key, value) {
  if (!modules || !key) return value;

  if (modules.legacyModules) {
    modules.legacyModules[key] = value;
  } else {
    modules[key] = value;
  }

  const scopeName = resolveModuleRegistryScopeNameForKey(key)
    || resolveGenericScopedCompatScopeName(modules.featureScopes, key);
  if (!scopeName) return value;

  if (!modules.featureScopes) {
    modules.featureScopes = {};
  }
  if (!modules.featureScopes[scopeName]) {
    modules.featureScopes[scopeName] = {};
  }
  modules.featureScopes[scopeName][key] = value;

  return value;
}

export function resolveModuleRegistryLegacyGameRoot(modules) {
  return modules?.featureScopes?.core?.GAME
    || resolveModuleRegistryLegacyCompat(modules).GAME
    || modules?.GAME
    || null;
}
