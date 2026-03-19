import { buildModuleRegistryGroups } from './build_module_registry_groups.js';
import { createModuleRegistryFlatCompat } from './create_module_registry_flat_compat.js';

/**
 * Builds a single module registry for composition root wiring.
 * Keeping this map out of main.js reduces entry-point fan-out.
 */
export function createModuleRegistry() {
  const groups = buildModuleRegistryGroups();

  return {
    ...createModuleRegistryFlatCompat(groups),
    featureScopes: Object.freeze({
      core: groups.core,
      title: groups.title,
      combat: groups.combat,
      run: groups.run,
      screen: groups.screen,
    }),
    _gameStarted: false,
    _canvasRefs: null,
  };
}
