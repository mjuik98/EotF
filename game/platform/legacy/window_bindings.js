import { attachLegacyWindowCommands } from './window_binding_commands.js';
import { attachLegacyWindowQueries } from './window_binding_queries.js';

function resolveBindingRoot(modules) {
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

export function attachLegacyWindowBindings(modules, fns, deps) {
  const root = resolveBindingRoot(modules);
  if (!root) return;

  attachLegacyWindowCommands(root, fns);
  attachLegacyWindowQueries(root, modules, fns, deps);
}
