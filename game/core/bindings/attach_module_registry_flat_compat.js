import {
  assignModuleRegistryCompatValue,
  listModuleRegistryScopedKeys,
  resolveModuleRegistryCompatValue,
} from './resolve_module_registry_legacy_compat.js';

export function attachModuleRegistryFlatCompat(target, legacyModules) {
  if (!target || !legacyModules || target === legacyModules) return target;

  const compatKeys = new Set([
    ...Object.keys(legacyModules),
    ...listModuleRegistryScopedKeys(target.featureScopes),
  ]);

  for (const key of compatKeys) {
    if (Object.prototype.hasOwnProperty.call(target, key)) continue;

    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: false,
      get() {
        return resolveModuleRegistryCompatValue(target, key);
      },
      set(value) {
        assignModuleRegistryCompatValue(target, key, value);
      },
    });
  }

  return target;
}
