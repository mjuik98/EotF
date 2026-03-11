import { buildRunBootActions } from '../../features/run/app/build_run_boot_actions.js';
import { buildTitleBootActions } from '../../features/title/app/build_title_boot_actions.js';

export function buildGameBootActionGroups(fns) {
  return {
    title: buildTitleBootActions(fns),
    run: buildRunBootActions(fns),
  };
}
