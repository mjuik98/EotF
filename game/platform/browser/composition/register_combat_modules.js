import { createCombatModuleCapabilities } from '../../../features/combat/ports/public_module_capabilities.js';

export function buildCombatCoreModuleRegistry() {
  return createCombatModuleCapabilities().core;
}

export function buildCombatCardModuleRegistry() {
  return createCombatModuleCapabilities().cards;
}

export function buildCombatHudModuleRegistry() {
  return createCombatModuleCapabilities().hud;
}

export function registerCombatModules() {
  const modules = createCombatModuleCapabilities();
  return {
    ...modules.core,
    ...modules.cards,
    ...modules.hud,
  };
}
