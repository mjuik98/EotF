import { buildLegacyWindowQueryGroups } from './build_legacy_window_query_groups.js';

function buildLegacyWindowQueryBindings(modules, fns, deps) {
  const groups = buildLegacyWindowQueryGroups(modules, fns, deps);

  return {
    ...groups.ui,
    ...groups.utility,
  };
}

export function attachLegacyWindowQueries(root, modules, fns, deps) {
  if (!root) return;
  Object.assign(root, buildLegacyWindowQueryBindings(modules, fns, deps));
}
