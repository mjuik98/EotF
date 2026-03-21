import { createLegacyModuleBagEnsurer } from '../../../../platform/legacy/game_module_registry.js';
import { resolveModuleRegistryValue } from '../../../../core/bindings/module_registry_scopes.js';

export const ensureRunFlowBrowserModules = createLegacyModuleBagEnsurer({
  resolveFromModules: (modules) => {
    const runModeUI = resolveModuleRegistryValue(modules, 'RunModeUI', ['run']);
    return runModeUI ? { RunModeUI: runModeUI } : null;
  },
  loadModuleBag: () => import('../../presentation/browser/run_mode_ui.js')
    .then((mod) => ({ RunModeUI: mod.RunModeUI })),
});
