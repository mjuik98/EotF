import { createLegacyGameStateRuntimeFacade } from '../game_state_core_methods.js';

export function createModuleRegistryFlatCompat(groups) {
  const coreGroup = groups?.core || {};
  return {
    ...coreGroup,
    GS: createLegacyGameStateRuntimeFacade(coreGroup.GS),
    ...groups.title,
    ...groups.combat,
    ...groups.run,
    ...groups.screen,
  };
}
