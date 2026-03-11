import { buildGameBootActionGroups } from './build_game_boot_action_groups.js';

export function buildGameBootActions(fns) {
  const groups = buildGameBootActionGroups(fns);

  return {
    ...groups.title,
    ...groups.run,
  };
}
