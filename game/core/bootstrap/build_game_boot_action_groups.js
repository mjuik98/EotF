import { buildRunBootPublicActions } from '../../features/run/ports/public_runtime_capabilities.js';
import { buildFrontdoorBootPublicActions } from '../../features/frontdoor/ports/runtime/public_frontdoor_runtime_surface.js';

export function buildGameBootActionGroups(fns) {
  return {
    title: buildFrontdoorBootPublicActions(fns),
    run: buildRunBootPublicActions(fns),
  };
}
