import {
  buildCombatCardBrowserModules,
  buildCombatCoreBrowserModules,
  buildCombatHudBrowserModules,
} from '../platform/browser/combat_browser_modules.js';

export function buildCombatPublicModules() {
  return buildCombatCoreBrowserModules();
}

export function buildCombatCardPublicModules() {
  return buildCombatCardBrowserModules();
}

export function buildCombatHudPublicModules() {
  return buildCombatHudBrowserModules();
}
