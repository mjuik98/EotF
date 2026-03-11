import { buildCombatCardModules } from './build_combat_card_modules.js';
import { buildCombatCoreModules } from './build_combat_core_modules.js';
import { buildCombatHudModules } from './build_combat_hud_modules.js';

export function registerCombatModules() {
  const groups = {
    core: buildCombatCoreModules(),
    cards: buildCombatCardModules(),
    hud: buildCombatHudModules(),
  };

  return {
    ...groups.core,
    ...groups.cards,
    ...groups.hud,
  };
}
