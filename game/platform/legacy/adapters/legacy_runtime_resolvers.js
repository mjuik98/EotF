export function getLegacyGameDeps(root) {
  return root?.getDeps?.() || {};
}

export function getLegacyFeatureDeps(root, feature = 'run') {
  if (!root) return {};

  if (feature === 'combat') return root.getCombatDeps?.() || {};
  if (feature === 'event') return root.getEventDeps?.() || {};
  if (feature === 'hud') return root.getHudDeps?.() || {};
  if (feature === 'ui') return root.getUiDeps?.() || {};
  if (feature === 'canvas') return root.getCanvasDeps?.() || {};
  return root.getRunDeps?.() || {};
}

export function resolveLegacyAction(name, {
  actions = {},
  root = null,
  win = null,
} = {}) {
  const injected = actions?.[name];
  if (typeof injected === 'function') return injected;

  const api = root?.API?.[name];
  if (typeof api === 'function') return api;

  const globalFn = win?.[name];
  if (typeof globalFn === 'function') return globalFn;

  return null;
}
