export function resolveScopedRuntimeModule(modules = {}, key, scopeNames = []) {
  for (const scopeName of scopeNames) {
    const scopedRefs = modules?.featureScopes?.[scopeName] || {};
    if (scopedRefs[key] !== undefined) {
      return scopedRefs[key];
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

export function resolveCoreRuntimeModule(modules = {}, key) {
  return resolveScopedRuntimeModule(modules, key, ['core']);
}
