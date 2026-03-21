export function getModuleRegistryScope(modules, scopeName) {
  return modules?.featureScopes?.[scopeName] || {};
}

function resolveTopLevelModuleRegistryValue(modules, key, options = {}) {
  if (!modules || !key) return undefined;

  if (options.topLevelDataOnly === true) {
    const descriptor = Object.getOwnPropertyDescriptor(modules, key);
    if (!descriptor || typeof descriptor.get === 'function') return undefined;
    return descriptor.value;
  }

  return modules?.[key];
}

function isAllowedModuleRegistryValue(value, options = {}) {
  if (value === undefined) return false;
  if (options.allowLazyModules === false && value?.__lazyModule === true) return false;
  return true;
}

export function resolveModuleRegistryValue(modules, key, scopeNames = [], options = {}) {
  for (const scopeName of scopeNames) {
    const scope = getModuleRegistryScope(modules, scopeName);
    if (isAllowedModuleRegistryValue(scope?.[key], options)) {
      return scope[key];
    }
  }

  if (isAllowedModuleRegistryValue(modules?.legacyModules?.[key], options)) {
    return modules.legacyModules[key];
  }

  const topLevelValue = resolveTopLevelModuleRegistryValue(modules, key, options);
  if (isAllowedModuleRegistryValue(topLevelValue, options)) {
    return topLevelValue;
  }

  return undefined;
}

export function resolveModuleRegistryGameRoot(modules, options = {}) {
  return resolveModuleRegistryValue(modules, 'GAME', ['core'], options) || null;
}
