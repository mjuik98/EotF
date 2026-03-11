import { buildLegacyGameAPICombatGroups } from './build_legacy_game_api_combat_groups.js';

export function buildLegacyGameAPICombatBindings(modules, fns) {
  const groups = buildLegacyGameAPICombatGroups(modules, fns);

  return {
    ...groups.hud,
    ...groups.player,
    ...groups.flow,
  };
}
