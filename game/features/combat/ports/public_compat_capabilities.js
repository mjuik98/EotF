import { CombatLifecycle } from '../application/combat_lifecycle_facade.js';
import { DeathHandler } from '../application/death_handler_facade.js';
import { CardMethods } from '../application/card_methods_facade.js';
import { CombatMethods } from '../application/combat_methods_facade.js';
import { DamageSystem } from '../application/damage_system_facade.js';
import { TurnManager } from '../application/turn_manager_facade.js';

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
