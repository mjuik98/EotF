export function composeLegacyWindowQueryGroups({
  ui = {},
  utility = {},
} = {}) {
  return {
    ui,
    utility,
  };
}

export function buildLegacySaveQueryBindings(modules = {}) {
  return {
    getSaveOutboxMetrics: () => modules.SaveSystem?.getOutboxMetrics?.() || null,
    flushSaveOutbox: () => modules.SaveSystem?.flushOutbox?.() || 0,
  };
}

export function buildLegacyMetricsQueryBindings(runtimeMetrics) {
  return {
    getRuntimeMetrics: (options) => runtimeMetrics.getRuntimeMetrics(options),
    resetRuntimeMetrics: () => runtimeMetrics.resetRuntimeMetrics(),
  };
}

export function composeLegacyGameApiRuntimeQueryGroups({
  save = {},
  metrics = {},
  hud = {},
} = {}) {
  return {
    save,
    metrics,
    hud,
  };
}

export function composeLegacyGameApiQueryGroups({
  module = {},
  runtime = {},
} = {}) {
  return {
    module,
    runtime,
  };
}

export function flattenLegacyGameApiRuntimeQueryGroups(groups = {}) {
  return {
    ...(groups.save || {}),
    ...(groups.metrics || {}),
    ...(groups.hud || {}),
  };
}

export function flattenLegacyGameApiQueryGroups(groups = {}) {
  return {
    ...(groups.module || {}),
    ...(groups.runtime || {}),
  };
}

export function composeLegacyGameApiPayload({
  actionGroups = {},
  queryBindings = {},
} = {}) {
  return {
    ...actionGroups,
    queryBindings,
  };
}
