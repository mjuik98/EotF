import {
  buildCombatCardBrowserModules,
  buildCombatCoreBrowserModules,
  buildCombatHudBrowserModules,
} from './combat_browser_modules.js';

export function buildCombatCoreModuleCapabilities() {
  return buildCombatCoreBrowserModules();
}

export function buildCombatCardModuleCapabilities() {
  return buildCombatCardBrowserModules();
}

export function buildCombatHudModuleCapabilities() {
  return buildCombatHudBrowserModules();
}
