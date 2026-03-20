import { publishLegacyModuleBag } from '../../../../platform/legacy/game_module_registry.js';
import { resolveUiRuntimeModule } from './resolve_ui_action_modules.js';

let settingsModulesPromise = null;

function assignSettingsModules(modules, settingsModules) {
  return publishLegacyModuleBag(modules, settingsModules);
}

export async function ensureSettingsBrowserModules(modules) {
  const settingsUI = resolveUiRuntimeModule(modules, 'SettingsUI', ['screen']);
  if (settingsUI) {
    return { SettingsUI: settingsUI };
  }

  if (!settingsModulesPromise) {
    settingsModulesPromise = import('../../presentation/browser/settings_ui.js')
      .then((mod) => ({ SettingsUI: mod.SettingsUI }))
      .catch((error) => {
        settingsModulesPromise = null;
        throw error;
      });
  }

  const settingsModules = await settingsModulesPromise;
  return assignSettingsModules(modules, settingsModules);
}
