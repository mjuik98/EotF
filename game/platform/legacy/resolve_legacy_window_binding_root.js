import { resolveLegacyGameRoot } from './resolve_legacy_module_bag.js';

export function resolveLegacyWindowBindingRoot(modules) {
  const gameRoot = resolveLegacyGameRoot(modules);
  const gameDeps =
    gameRoot?.getUiDeps?.()
    || gameRoot?.getRunDeps?.()
    || gameRoot?.getCombatDeps?.()
    || {};
  if (gameDeps.win) return gameDeps.win;
  if (gameDeps.doc?.defaultView) return gameDeps.doc.defaultView;
  try {
    const host = Function('return this')();
    return host?.window || host || null;
  } catch {
    return null;
  }
}
