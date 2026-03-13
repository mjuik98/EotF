import { createCombatModuleCapabilities } from '../../../features/combat/ports/public_module_capabilities.js';

export function buildCombatHudModules() {
  return createCombatModuleCapabilities().hud;
}
