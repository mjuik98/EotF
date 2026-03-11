import { buildGameBootActions } from './build_game_boot_actions.js';
import { buildGameBootRefs } from './build_game_boot_refs.js';

export function buildGameBootPayload({ modules, deps, fns }) {
  return {
    ...buildGameBootRefs({ modules, deps }),
    actions: buildGameBootActions(fns),
  };
}
