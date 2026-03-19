import { getModuleRegistryScope } from '../bindings/module_registry_scopes.js';

const BINDING_SCOPE_ORDER = Object.freeze(['core', 'title', 'combat', 'run', 'screen']);
const NON_MODULE_REGISTRY_KEYS = new Set(['featureScopes', 'legacyModules', '_gameStarted', '_canvasRefs']);

function collectTopLevelModuleRefs(modules) {
  return Object.entries(modules || {}).reduce((refs, [key, value]) => {
    if (NON_MODULE_REGISTRY_KEYS.has(key)) return refs;
    refs[key] = value;
    return refs;
  }, {});
}

function collectScopedModuleRefs(modules) {
  const scopeNames = Object.keys(modules?.featureScopes || {});
  const orderedScopeNames = [
    ...BINDING_SCOPE_ORDER.filter((scopeName) => scopeNames.includes(scopeName)),
    ...scopeNames.filter((scopeName) => !BINDING_SCOPE_ORDER.includes(scopeName)),
  ];

  return orderedScopeNames.reduce((refs, scopeName) => (
    Object.assign(refs, getModuleRegistryScope(modules, scopeName))
  ), {});
}

export function buildBindingDepsRefs({ modules, fns }) {
  const moduleRefs = modules?.featureScopes
    ? {
      ...collectTopLevelModuleRefs(modules),
      ...collectScopedModuleRefs(modules),
    }
    : collectTopLevelModuleRefs(modules);

  return {
    ...moduleRefs,
    ...fns,
  };
}
