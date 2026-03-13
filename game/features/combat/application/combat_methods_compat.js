import { CombatLifecycle } from './combat_lifecycle_compat.js';
import { DamageSystem } from './damage_system_compat.js';
import { DeathHandler } from './death_handler_compat.js';

export const CombatMethods = {
  ...DamageSystem,
  ...DeathHandler,
  ...CombatLifecycle,
};
