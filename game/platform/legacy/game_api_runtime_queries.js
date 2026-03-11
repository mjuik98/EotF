import { buildLegacyGameAPIRuntimeQueryGroups } from './build_legacy_game_api_runtime_query_groups.js';

export function buildLegacyGameAPIRuntimeQueries(modules, deps, runtimeMetrics) {
  const groups = buildLegacyGameAPIRuntimeQueryGroups(modules, deps, runtimeMetrics);

  return {
    ...groups.save,
    ...groups.metrics,
    ...groups.hud,
  };
}
