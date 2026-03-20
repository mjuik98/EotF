import { CombatLifecycle } from '../compat/combat_lifecycle.js';
import { DeathHandler } from '../compat/death_handler.js';
import { CardMethods } from '../compat/card_methods.js';
import { CombatMethods } from '../compat/combat_methods.js';
import { DamageSystem } from '../compat/damage_system.js';
import { TurnManager } from '../compat/turn_manager.js';

export function createCombatCompatCapabilities() {
  return {
    CardMethods,
    CombatLifecycle,
    CombatMethods,
    DamageSystem,
    DeathHandler,
    TurnManager,
  };
}

export {
  CardMethods,
  CombatLifecycle,
  CombatMethods,
  DamageSystem,
  DeathHandler,
  TurnManager,
};
