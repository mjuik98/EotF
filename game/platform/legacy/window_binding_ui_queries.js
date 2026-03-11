import { buildLegacyWindowUIQueryGroups } from './build_legacy_window_ui_query_groups.js';

export function buildLegacyWindowUIQueries(modules, fns, deps) {
  const groups = buildLegacyWindowUIQueryGroups(modules, fns, deps);

  return {
    ...groups.hud,
    ...groups.combat,
  };
}
