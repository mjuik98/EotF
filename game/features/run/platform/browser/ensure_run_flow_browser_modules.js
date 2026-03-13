let runFlowModulesPromise = null;

function assignRunFlowModules(modules, runFlowModules) {
  if (!modules || !runFlowModules) return runFlowModules;

  Object.assign(modules, runFlowModules);

  if (typeof modules.GAME?.register === 'function') {
    for (const [name, moduleObj] of Object.entries(runFlowModules)) {
      modules.GAME.register(name, moduleObj);
    }
  }

  return runFlowModules;
}

export async function ensureRunFlowBrowserModules(modules) {
  if (modules?.RunModeUI) {
    return { RunModeUI: modules.RunModeUI };
  }

  if (!runFlowModulesPromise) {
    runFlowModulesPromise = import('../../presentation/browser/run_mode_ui.js')
      .then((mod) => ({ RunModeUI: mod.RunModeUI }))
      .catch((error) => {
        runFlowModulesPromise = null;
        throw error;
      });
  }

  const runFlowModules = await runFlowModulesPromise;
  return assignRunFlowModules(modules, runFlowModules);
}
