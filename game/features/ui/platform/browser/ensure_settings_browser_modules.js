import { resolveUiRuntimeModule } from './resolve_ui_action_modules.js';

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

export const ensureSettingsBrowserModules = createFeatureModuleBagEnsurer({
  resolveFromModules: (modules) => {
    const settingsUI = resolveUiRuntimeModule(modules, 'SettingsUI', ['screen']);
    return settingsUI ? { SettingsUI: settingsUI } : null;
  },
  loadModuleBag: () => import('../../presentation/browser/settings_ui.js')
    .then((mod) => ({ SettingsUI: mod.SettingsUI })),
});
