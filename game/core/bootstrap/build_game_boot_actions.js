import { buildRunBootActions } from '../../features/run/app/build_run_boot_actions.js';
import { buildTitleBootActions } from '../../features/title/app/build_title_boot_actions.js';

export function buildGameBootActions(fns) {
  return {
    ...buildTitleBootActions(fns),
    ...buildRunBootActions(fns),
  };
}
