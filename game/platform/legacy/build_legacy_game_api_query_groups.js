import { buildLegacyGameAPIModuleQueries } from './game_api_module_queries.js';
import { buildLegacyGameAPIRuntimeQueries } from './game_api_runtime_queries.js';
import { composeLegacyGameApiQueryGroups } from '../../shared/runtime/public.js';

export function buildLegacyGameAPIQueryGroups(modules, deps, runtimeMetrics) {
  return composeLegacyGameApiQueryGroups({
    module: buildLegacyGameAPIModuleQueries(modules),
    runtime: buildLegacyGameAPIRuntimeQueries(modules, deps, runtimeMetrics),
  });
}
