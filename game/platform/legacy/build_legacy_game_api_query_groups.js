import { buildLegacyGameAPIModuleQueries } from './game_api_module_queries.js';
import { buildLegacyGameAPIRuntimeQueries } from './game_api_runtime_queries.js';

export function buildLegacyGameAPIQueryGroups(modules, deps, runtimeMetrics) {
  return {
    module: buildLegacyGameAPIModuleQueries(modules),
    runtime: buildLegacyGameAPIRuntimeQueries(modules, deps, runtimeMetrics),
  };
}
