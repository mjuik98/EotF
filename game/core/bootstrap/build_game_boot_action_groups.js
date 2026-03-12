import { buildRunBootPublicActions } from '../../features/run/runtime/public_run_runtime_actions.js';
import { buildTitleBootPublicActions } from '../../features/title/public.js';

export function buildGameBootActionGroups(fns) {
  return {
    title: buildTitleBootPublicActions(fns),
    run: buildRunBootPublicActions(fns),
  };
}
