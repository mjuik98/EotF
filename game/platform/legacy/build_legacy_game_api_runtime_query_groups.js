import { buildLegacyGameApiRuntimeHudQueryGroups } from '../../features/ui/ports/runtime/public_ui_runtime_surface.js';
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
