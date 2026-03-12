import {
  buildCombatCardPublicModules,
  buildCombatHudPublicModules,
  buildCombatPublicModules,
} from '../../../features/combat/modules/public_combat_modules.js';

export function registerCombatModules() {
  return {
    ...buildCombatPublicModules(),
    ...buildCombatCardPublicModules(),
    ...buildCombatHudPublicModules(),
  };
}
