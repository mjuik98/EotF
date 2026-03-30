import { createCombatSystemCapabilities } from '../../../features/combat/ports/public_system_capabilities.js';
import { ClassMechanics, SetBonusSystem } from '../../../shared/progression/public.js';

export function buildCoreProgressionModules() {
  const { difficulty } = createCombatSystemCapabilities();

  return {
    DifficultyScaler: difficulty.DifficultyScaler,
    ClassMechanics,
    SetBonusSystem,
  };
}
