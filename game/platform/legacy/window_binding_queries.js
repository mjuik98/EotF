import { buildLegacyWindowQueryGroups } from './build_legacy_window_query_groups.js';
import { mergeLegacyWindowQueryGroups } from '../../shared/runtime/public.js';

function buildLegacyWindowQueryBindings(modules, fns, deps) {
  return mergeLegacyWindowQueryGroups(
    buildLegacyWindowQueryGroups(modules, fns, deps),
  );
}

export function attachLegacyWindowQueries(root, modules, fns, deps) {
  if (!root) return;
  Object.assign(root, buildLegacyWindowQueryBindings(modules, fns, deps));
}
