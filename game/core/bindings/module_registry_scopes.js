export function getModuleRegistryScope(modules, scopeName) {
  return modules?.featureScopes?.[scopeName] || {};
}
