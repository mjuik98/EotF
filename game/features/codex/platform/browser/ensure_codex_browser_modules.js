import { buildCodexPrimaryBrowserModules } from './codex_browser_modules.js';

function assignCodexModules(modules, codexModules) {
  if (!modules || !codexModules) return codexModules;

  Object.assign(modules, codexModules);

  if (typeof modules.GAME?.register === 'function') {
    for (const [name, moduleObj] of Object.entries(codexModules)) {
      modules.GAME.register(name, moduleObj);
    }
  }

  return codexModules;
}

export async function ensureCodexBrowserModules(modules) {
  if (modules?.CodexUI) {
    return { CodexUI: modules.CodexUI };
  }

  const codexModules = buildCodexPrimaryBrowserModules();
  return assignCodexModules(modules, codexModules);
}
