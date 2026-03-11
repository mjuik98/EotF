import { buildLegacyGameAPIQueryGroups } from './build_legacy_game_api_query_groups.js';

export function buildLegacyGameAPIQueryBindings(modules, deps, runtimeMetrics) {
  const groups = buildLegacyGameAPIQueryGroups(modules, deps, runtimeMetrics);

  return {
    ...groups.module,
    ...groups.runtime,
  };
}
