import { buildLegacyWindowUIQueries } from './window_binding_ui_queries.js';
import { buildLegacyWindowUtilityQueries } from './window_binding_utility_queries.js';
import { composeLegacyWindowQueryGroups } from '../../shared/runtime/public.js';

export function buildLegacyWindowQueryGroups(modules, fns, deps) {
  return composeLegacyWindowQueryGroups({
    ui: buildLegacyWindowUIQueries(modules, fns, deps),
    utility: buildLegacyWindowUtilityQueries(modules),
  });
}
