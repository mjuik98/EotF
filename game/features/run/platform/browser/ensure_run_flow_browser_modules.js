import { publishLegacyModuleBag } from '../../../../platform/legacy/game_module_registry.js';

let runFlowModulesPromise = null;

function assignRunFlowModules(modules, runFlowModules) {
  return publishLegacyModuleBag(modules, runFlowModules);
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
