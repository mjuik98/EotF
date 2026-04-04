import { createCombatSystemCapabilities } from '../../../features/combat/ports/public_system_capabilities.js';
import { SetBonusSystem } from '../../../shared/progression/public.js';

export function buildCoreProgressionModules() {
  const { classMechanics, difficulty } = createCombatSystemCapabilities();

  return {
    DifficultyScaler: difficulty.DifficultyScaler,
    ClassMechanics: classMechanics.ClassMechanics,
    SetBonusSystem,
  };
}
