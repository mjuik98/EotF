export function buildLegacyGameAPIRuntimeQueryGroups(modules, deps, runtimeMetrics) {
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
      updateUI: () => modules.HudUpdateUI?.updateUI?.(deps.getHudUpdateDeps()),
      processDirtyFlags: () =>
        modules.HudUpdateUI?.processDirtyFlags?.(deps.getHudUpdateDeps()),
    },
  };
}
