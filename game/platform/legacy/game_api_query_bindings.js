import { buildLegacyGameAPIQueryGroups } from './build_legacy_game_api_query_groups.js';
import { flattenLegacyGameApiQueryGroups } from '../../shared/runtime/public.js';

export function buildLegacyGameAPIQueryBindings(modules, deps, runtimeMetrics) {
  return flattenLegacyGameApiQueryGroups(
    buildLegacyGameAPIQueryGroups(modules, deps, runtimeMetrics),
  );
}
