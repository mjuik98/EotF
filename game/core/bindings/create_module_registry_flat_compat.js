import { createLegacyGameStateRuntimeFacade } from '../game_state_core_methods.js';

export function createModuleRegistryFlatCompat(groups) {
  const coreGroup = groups?.core || {};
  const titleGroup = groups?.title || {};
  const combatGroup = groups?.combat || {};
  const runGroup = groups?.run || {};
  const codexGroup = groups?.codex || {};
  const eventGroup = groups?.event || {};
  const rewardGroup = groups?.reward || {};
  const screenGroup = groups?.screen || {};
  return {
    ...coreGroup,
    GS: createLegacyGameStateRuntimeFacade(coreGroup.GS),
    ...titleGroup,
    ...combatGroup,
    ...runGroup,
    ...codexGroup,
    ...eventGroup,
    ...rewardGroup,
    ...screenGroup,
  };
}
