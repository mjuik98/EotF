import { buildRunBootPublicActions } from '../../features/run/ports/public_runtime_capabilities.js';
import { buildTitleBootPublicActions } from '../../features/title/ports/runtime/public_title_runtime_surface.js';

export function buildGameBootActionGroups(fns) {
  return {
    title: buildTitleBootPublicActions(fns),
    run: buildRunBootPublicActions(fns),
  };
}
