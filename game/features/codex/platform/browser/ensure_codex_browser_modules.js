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

export const ensureCodexBrowserModules = createFeatureModuleBagEnsurer({
  resolveFromModules: (modules) => {
    const codexUI = resolveModuleRegistryValue(modules, 'CodexUI', ['codex', 'screen'], {
      allowLazyModules: false,
    });
    return codexUI ? { CodexUI: codexUI } : null;
  },
  loadModuleBag: () => import('../../presentation/browser/codex_ui.js')
    .then((mod) => ({ CodexUI: mod.CodexUI })),
  prepareLoadedModuleBag: (modules, codexModules) => {
    if (modules) {
      modules.CodexUI = codexModules.CodexUI;
    }
  },
});
