import { resolveModuleRegistryValue } from '../../../../core/bindings/module_registry_scopes.js';

function createFeatureModuleBagEnsurer(options = {}) {
  const { resolveFromModules = null, loadModuleBag, prepareLoadedModuleBag = null } = options;
  let moduleBagPromise = null;

  return async function ensureFeatureModuleBag(modules) {
    const resolvedModuleBag = typeof resolveFromModules === 'function'
      ? resolveFromModules(modules)
      : null;
    if (resolvedModuleBag) return resolvedModuleBag;

    if (!moduleBagPromise) {
      moduleBagPromise = Promise.resolve()
        .then(() => loadModuleBag?.())
        .catch((error) => {
          moduleBagPromise = null;
          throw error;
        });
    }

    const moduleBag = await moduleBagPromise;
    if (typeof prepareLoadedModuleBag === 'function') {
      prepareLoadedModuleBag(modules, moduleBag);
    }
    Object.assign(modules?.legacyModules || modules || {}, moduleBag);
    return moduleBag;
  };
}

export const ensureRunFlowBrowserModules = createFeatureModuleBagEnsurer({
  resolveFromModules: (modules) => {
    const runModeUI = resolveModuleRegistryValue(modules, 'RunModeUI', ['run']);
    return runModeUI ? { RunModeUI: runModeUI } : null;
  },
  loadModuleBag: () => import('../../presentation/browser/run_mode_ui.js')
    .then((mod) => ({ RunModeUI: mod.RunModeUI })),
});
