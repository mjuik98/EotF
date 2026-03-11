import { DifficultyScaler } from '../../../combat/difficulty_scaler.js';
import { ClassMechanics } from '../../../domain/class/class_mechanics.js';
import { SetBonusSystem } from '../../../systems/set_bonus_system.js';

export function buildCoreProgressionModules() {
  return {
    DifficultyScaler,
    ClassMechanics,
    SetBonusSystem,
  };
}
