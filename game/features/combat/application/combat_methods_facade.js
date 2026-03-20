import { CombatLifecycle } from './combat_lifecycle_facade.js';
import { DamageSystem } from './damage_system_facade.js';
import { DeathHandler } from './death_handler_facade.js';

export const CombatMethods = {
  ...DamageSystem,
  ...DeathHandler,
  ...CombatLifecycle,
};
