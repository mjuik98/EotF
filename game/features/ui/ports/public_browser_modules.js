import { ensureSettingsBrowserModules } from '../platform/browser/ensure_settings_browser_modules.js';

export function createUiBrowserModuleCapabilities() {
  return {
    ensureSettings: ensureSettingsBrowserModules,
  };
}

export { ensureSettingsBrowserModules };
