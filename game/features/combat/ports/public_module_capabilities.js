import {
  buildCombatCardBrowserModules,
  buildCombatCoreBrowserModules,
  buildCombatHudBrowserModules,
} from '../platform/browser/combat_browser_modules.js';

export function createCombatModuleCapabilities() {
  return {
    core: buildCombatCoreBrowserModules(),
    cards: buildCombatCardBrowserModules(),
    hud: buildCombatHudBrowserModules(),
  };
}
