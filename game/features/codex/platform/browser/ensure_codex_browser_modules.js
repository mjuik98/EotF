import { createLegacyModuleBagEnsurer } from '../../../../platform/legacy/game_module_registry.js';
import { resolveModuleRegistryValue } from '../../../../core/bindings/module_registry_scopes.js';

export const ensureCodexBrowserModules = createLegacyModuleBagEnsurer({
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
