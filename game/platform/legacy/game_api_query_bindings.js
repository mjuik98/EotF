import { buildLegacyGameAPIModuleQueries } from './game_api_module_queries.js';
import { buildLegacyGameAPIRuntimeQueries } from './game_api_runtime_queries.js';

export function buildLegacyGameAPIQueryBindings(modules, deps, runtimeMetrics) {
  return {
    ...buildLegacyGameAPIModuleQueries(modules),
    ...buildLegacyGameAPIRuntimeQueries(modules, deps, runtimeMetrics),
  };
}
