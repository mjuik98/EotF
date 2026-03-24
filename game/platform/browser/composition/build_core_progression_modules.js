import { ClassMechanics } from '../../../shared/class/class_mechanics.js';
import { createCombatSystemCapabilities } from '../../../features/combat/ports/public_system_capabilities.js';
import { SetBonusSystem } from '../../../shared/progression/set_bonus_system.js';

export function buildCoreProgressionModules() {
  const { difficulty } = createCombatSystemCapabilities();

  return {
    DifficultyScaler: difficulty.DifficultyScaler,
    ClassMechanics,
    SetBonusSystem,
  };
}
