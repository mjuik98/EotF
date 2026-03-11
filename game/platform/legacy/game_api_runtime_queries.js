export function buildLegacyGameAPIRuntimeQueries(modules, deps, runtimeMetrics) {
  return {
    getSaveOutboxMetrics: () => modules.SaveSystem?.getOutboxMetrics?.() || null,
    flushSaveOutbox: () => modules.SaveSystem?.flushOutbox?.() || 0,
    getRuntimeMetrics: (options) => runtimeMetrics.getRuntimeMetrics(options),
    resetRuntimeMetrics: () => runtimeMetrics.resetRuntimeMetrics(),
    updateUI: () => modules.HudUpdateUI?.updateUI?.(deps.getHudUpdateDeps()),
    processDirtyFlags: () => modules.HudUpdateUI?.processDirtyFlags?.(deps.getHudUpdateDeps()),
  };
}
