import { createLegacyGameStateRuntimeFacade } from '../game_state_core_methods.js';
import { listModuleRegistryLegacyCompatKeys } from './resolve_module_registry_legacy_compat.js';

export function createModuleRegistryFlatCompat(featureScopes) {
  const compatModules = {};
  const assignedValues = new Map();
  const scopeGroups = Object.values(featureScopes || {}).filter(Boolean);
  const compatKeys = listModuleRegistryLegacyCompatKeys(featureScopes);
  let cachedRawGs = null;
  let cachedLegacyGs = null;

  function resolveScopedValue(key) {
    for (let index = scopeGroups.length - 1; index >= 0; index -= 1) {
      const group = scopeGroups[index];
      if (group?.[key] !== undefined) {
        return group[key];
      }
    }
    return undefined;
  }

  function resolveCompatValue(key) {
    if (assignedValues.has(key)) return assignedValues.get(key);

    const scopedValue = resolveScopedValue(key);
    if (key !== 'GS') return scopedValue;
    if (!scopedValue) return scopedValue;

    if (cachedRawGs !== scopedValue) {
      cachedRawGs = scopedValue;
      cachedLegacyGs = createLegacyGameStateRuntimeFacade(scopedValue);
    }

    return cachedLegacyGs;
  }

  for (const key of compatKeys) {
    Object.defineProperty(compatModules, key, {
      configurable: true,
      enumerable: true,
      get() {
        return resolveCompatValue(key);
      },
      set(value) {
        assignedValues.set(key, value);
      },
    });
  }

  return compatModules;
}
