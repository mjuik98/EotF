import { createLegacyHudRuntimeQueryBindings } from '../../features/ui/public.js';

export function buildLegacyGameAPIRuntimeQueryGroups(modules, deps, runtimeMetrics) {
  const hudQueries = createLegacyHudRuntimeQueryBindings({ modules, deps });

  return {
    save: {
      getSaveOutboxMetrics: () => modules.SaveSystem?.getOutboxMetrics?.() || null,
      flushSaveOutbox: () => modules.SaveSystem?.flushOutbox?.() || 0,
    },
    metrics: {
      getRuntimeMetrics: (options) => runtimeMetrics.getRuntimeMetrics(options),
      resetRuntimeMetrics: () => runtimeMetrics.resetRuntimeMetrics(),
    },
    hud: {
      updateUI: hudQueries.updateUI,
      processDirtyFlags: hudQueries.processDirtyFlags,
    },
  };
}
