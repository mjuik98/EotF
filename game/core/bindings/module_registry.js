import { buildModuleRegistryGroups } from './build_module_registry_groups.js';
import { attachModuleRegistryFlatCompat } from './attach_module_registry_flat_compat.js';
import { createModuleRegistryFeatureScopes } from './create_module_registry_feature_scopes.js';
import { createModuleRegistryFlatCompat } from './create_module_registry_flat_compat.js';
import { createModuleRegistryRuntimeState } from './create_module_registry_runtime_state.js';

/**
 * Builds a single module registry for composition root wiring.
 * Keeping this map out of main.js reduces entry-point fan-out.
 */
export function createModuleRegistry() {
  const groups = buildModuleRegistryGroups();
  const legacyModules = createModuleRegistryFlatCompat(groups);
  const registry = {
    legacyModules,
    featureScopes: createModuleRegistryFeatureScopes(groups),
    ...createModuleRegistryRuntimeState(),
  };

  return attachModuleRegistryFlatCompat(registry, legacyModules);
}
