export function resolveLegacyWindowBindingRoot(modules) {
  const gameDeps =
    modules?.GAME?.getUiDeps?.()
    || modules?.GAME?.getRunDeps?.()
    || modules?.GAME?.getCombatDeps?.()
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
