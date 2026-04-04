import { DifficultyScaler } from '../domain/difficulty_scaler.js';
import { ClassMechanics } from '../domain/class_mechanic_rules.js';

export function createCombatSystemCapabilities() {
  return {
    difficulty: {
      DifficultyScaler,
    },
    classMechanics: {
      ClassMechanics,
    },
  };
}

export { DifficultyScaler };
export { ClassMechanics };
