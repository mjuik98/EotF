import { buildModuleRegistryGroups } from './build_module_registry_groups.js';

/**
 * Builds a single module registry for composition root wiring.
 * Keeping this map out of main.js reduces entry-point fan-out.
 */
export function createModuleRegistry() {
  const groups = buildModuleRegistryGroups();

  return {
    ...groups.core,
    ...groups.title,
    ...groups.combat,
    ...groups.run,
    ...groups.screen,
    _gameStarted: false,
    _canvasRefs: null,
  };
}
