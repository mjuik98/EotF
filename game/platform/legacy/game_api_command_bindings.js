import { buildLegacyGameAPICommandGroups } from './build_legacy_game_api_command_groups.js';

export function buildLegacyGameAPICommandBindings(modules, fns) {
  const groups = buildLegacyGameAPICommandGroups(modules, fns);

  return {
    ...groups.combat,
    ...groups.codex,
    ...groups.reward,
    ...groups.run,
    ...groups.settings,
  };
}
