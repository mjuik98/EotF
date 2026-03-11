import { buildLegacyWindowUIQueries } from './window_binding_ui_queries.js';
import { buildLegacyWindowUtilityQueries } from './window_binding_utility_queries.js';

export function buildLegacyWindowQueryGroups(modules, fns, deps) {
  return {
    ui: buildLegacyWindowUIQueries(modules, fns, deps),
    utility: buildLegacyWindowUtilityQueries(modules),
  };
}
