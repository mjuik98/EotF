import {
  buildCombatCardModuleCapabilities,
  buildCombatCoreModuleCapabilities,
  buildCombatHudModuleCapabilities,
} from '../platform/browser/combat_module_capabilities.js';

export function buildCombatPublicModules() {
  return buildCombatCoreModuleCapabilities();
}

export function buildCombatCardPublicModules() {
  return buildCombatCardModuleCapabilities();
}

export function buildCombatHudPublicModules() {
  return buildCombatHudModuleCapabilities();
}

export function createCombatModuleCapabilities() {
  return {
    core: buildCombatPublicModules(),
    cards: buildCombatCardPublicModules(),
    hud: buildCombatHudPublicModules(),
  };
}
