import { buildLegacyGameApiRuntimeHudQueryGroups } from '../../features/ui/public.js';
import {
  buildLegacyMetricsQueryBindings,
  buildLegacySaveQueryBindings,
  composeLegacyGameApiRuntimeQueryGroups,
} from '../../shared/runtime/public.js';

export function buildLegacyGameAPIRuntimeQueryGroups(modules, deps, runtimeMetrics) {
  const hudGroups = buildLegacyGameApiRuntimeHudQueryGroups({ modules, deps });

  return composeLegacyGameApiRuntimeQueryGroups({
    save: buildLegacySaveQueryBindings(modules),
    metrics: buildLegacyMetricsQueryBindings(runtimeMetrics),
    hud: hudGroups.hud,
  });
}
