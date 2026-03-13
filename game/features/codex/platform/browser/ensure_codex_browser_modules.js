let codexModulesPromise = null;

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

  if (!codexModulesPromise) {
    codexModulesPromise = import('./codex_browser_modules.js')
      .then((mod) => mod.buildCodexPrimaryBrowserModules())
      .catch((error) => {
        codexModulesPromise = null;
        throw error;
      });
  }

  const codexModules = await codexModulesPromise;
  return assignCodexModules(modules, codexModules);
}
