import { buildLegacyWindowUIQueries } from './window_binding_ui_queries.js';
import { buildLegacyWindowUtilityQueries } from './window_binding_utility_queries.js';

function buildLegacyWindowQueryBindings(modules, fns, deps) {
  return {
    ...buildLegacyWindowUIQueries(modules, fns, deps),
    ...buildLegacyWindowUtilityQueries(modules),
  };
}

export function attachLegacyWindowQueries(root, modules, fns, deps) {
  if (!root) return;
  Object.assign(root, buildLegacyWindowQueryBindings(modules, fns, deps));
}
