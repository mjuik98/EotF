import { createLegacyModuleBagEnsurer } from '../../../../platform/legacy/game_module_registry.js';
import { resolveUiRuntimeModule } from './resolve_ui_action_modules.js';

export const ensureSettingsBrowserModules = createLegacyModuleBagEnsurer({
  resolveFromModules: (modules) => {
    const settingsUI = resolveUiRuntimeModule(modules, 'SettingsUI', ['screen']);
    return settingsUI ? { SettingsUI: settingsUI } : null;
  },
  loadModuleBag: () => import('../../presentation/browser/settings_ui.js')
    .then((mod) => ({ SettingsUI: mod.SettingsUI })),
});
