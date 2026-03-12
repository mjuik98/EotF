import { buildLegacyGameAPIRuntimeQueryGroups } from './build_legacy_game_api_runtime_query_groups.js';
import { flattenLegacyGameApiRuntimeQueryGroups } from '../../shared/runtime/public.js';

export function buildLegacyGameAPIRuntimeQueries(modules, deps, runtimeMetrics) {
  return flattenLegacyGameApiRuntimeQueryGroups(
    buildLegacyGameAPIRuntimeQueryGroups(modules, deps, runtimeMetrics),
  );
}
