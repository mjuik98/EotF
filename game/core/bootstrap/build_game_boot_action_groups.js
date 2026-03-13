import { buildRunBootPublicActions } from '../../features/run/ports/runtime/public_run_runtime_surface.js';
import { buildTitleBootPublicActions } from '../../features/title/ports/runtime/public_title_runtime_surface.js';

export function buildGameBootActionGroups(fns) {
  return {
    title: buildTitleBootPublicActions(fns),
    run: buildRunBootPublicActions(fns),
  };
}
