import { createCombatStartRuntime } from '../../features/combat/application/create_combat_start_runtime.js';

const combatStartRuntime = createCombatStartRuntime();

export const CombatStartUI = {
  startCombat(mode = 'normal', deps = {}) {
    return combatStartRuntime.startCombat(mode, deps);
  },
};
