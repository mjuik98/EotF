export function getModuleRegistryScope(modules, scopeName) {
  return modules?.featureScopes?.[scopeName] || {};
}

export function resolveModuleRegistryValue(modules, key, scopeNames = []) {
  for (const scopeName of scopeNames) {
    const scope = getModuleRegistryScope(modules, scopeName);
    if (scope?.[key] !== undefined) {
      return scope[key];
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

export function resolveModuleRegistryGameRoot(modules) {
  return resolveModuleRegistryValue(modules, 'GAME', ['core']) || null;
}
