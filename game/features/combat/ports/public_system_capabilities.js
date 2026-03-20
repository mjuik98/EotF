import { DifficultyScaler } from '../domain/difficulty_scaler.js';

export function createCombatSystemCapabilities() {
  return {
    difficulty: {
      DifficultyScaler,
    },
  };
}

export { DifficultyScaler };
