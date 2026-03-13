import { ClassMechanics } from '../../../domain/class/class_mechanics.js';
import { DifficultyScaler } from '../../../features/combat/domain/difficulty_scaler.js';
import { SetBonusSystem } from '../../../shared/progression/set_bonus_system.js';

export function buildCoreProgressionModules() {
  return {
    DifficultyScaler,
    ClassMechanics,
    SetBonusSystem,
  };
}
