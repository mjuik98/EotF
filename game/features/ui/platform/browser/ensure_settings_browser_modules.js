import { publishLegacyModuleBag } from '../../../../platform/legacy/game_module_registry.js';

let settingsModulesPromise = null;

function assignSettingsModules(modules, settingsModules) {
  return publishLegacyModuleBag(modules, settingsModules);
}

export async function ensureSettingsBrowserModules(modules) {
  if (modules?.SettingsUI) {
    return { SettingsUI: modules.SettingsUI };
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
