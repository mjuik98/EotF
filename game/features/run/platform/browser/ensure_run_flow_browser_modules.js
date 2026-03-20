import { publishLegacyModuleBag } from '../../../../platform/legacy/game_module_registry.js';

let runFlowModulesPromise = null;

function resolveRunRuntimeModule(modules = {}, key, scopeNames = []) {
  for (const scopeName of scopeNames) {
    const scopedRefs = modules?.featureScopes?.[scopeName] || {};
    if (scopedRefs[key] !== undefined) {
      return scopedRefs[key];
    }
  }

  if (modules?.legacyModules?.[key] !== undefined) {
    return modules.legacyModules[key];
  }

  if (modules?.[key] !== undefined) {
    return modules[key];
  }

  return undefined;
}

function assignRunFlowModules(modules, runFlowModules) {
  return publishLegacyModuleBag(modules, runFlowModules);
}

export async function ensureRunFlowBrowserModules(modules) {
  const runModeUI = resolveRunRuntimeModule(modules, 'RunModeUI', ['run']);
  if (runModeUI) {
    return { RunModeUI: runModeUI };
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
