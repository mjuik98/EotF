let settingsModulesPromise = null;

function assignSettingsModules(modules, settingsModules) {
  if (!modules || !settingsModules) return settingsModules;

  Object.assign(modules, settingsModules);

  if (typeof modules.GAME?.register === 'function') {
    for (const [name, moduleObj] of Object.entries(settingsModules)) {
      modules.GAME.register(name, moduleObj);
    }
  }

  return settingsModules;
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
