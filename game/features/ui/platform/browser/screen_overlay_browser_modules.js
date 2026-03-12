import { HelpPauseUI } from '../../presentation/browser/help_pause_ui.js';
import { MetaProgressionUI } from '../../presentation/browser/meta_progression_ui.js';
import { SettingsUI } from '../../presentation/browser/settings_ui.js';

export function buildScreenOverlayBrowserModules() {
  return {
    MetaProgressionUI,
    HelpPauseUI,
    SettingsUI,
  };
}
