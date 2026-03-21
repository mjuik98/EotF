import {
  resolveModuleRegistryGameRoot,
  resolveModuleRegistryValue,
} from '../../core/bindings/module_registry_scopes.js';

export function resolveScopedRuntimeModule(modules = {}, key, scopeNames = [], options = {}) {
  return resolveModuleRegistryValue(modules, key, scopeNames, options);
}

export function resolveCoreRuntimeModule(modules = {}, key, options = {}) {
  if (key === 'GAME') {
    return resolveModuleRegistryGameRoot(modules, options);
  }
  return resolveScopedRuntimeModule(modules, key, ['core'], options);
}
