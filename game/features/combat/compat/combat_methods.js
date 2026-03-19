import { CombatLifecycle } from './combat_lifecycle.js';
import { DamageSystem } from './damage_system.js';
import { DeathHandler } from './death_handler.js';

export const CombatMethods = {
  ...DamageSystem,
  ...DeathHandler,
  ...CombatLifecycle,
};
