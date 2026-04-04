import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  ClassMechanics: { id: 'class' },
  SetBonusSystem: { id: 'set-bonus' },
  DifficultyScaler: { id: 'difficulty' },
}));

vi.mock('../game/shared/progression/set_bonus_system.js', () => ({
  SetBonusSystem: hoisted.SetBonusSystem,
}));

vi.mock('../game/features/combat/ports/public_system_capabilities.js', () => ({
  createCombatSystemCapabilities: vi.fn(() => ({
    difficulty: {
      DifficultyScaler: hoisted.DifficultyScaler,
    },
    classMechanics: {
      ClassMechanics: hoisted.ClassMechanics,
    },
  })),
}));

import { buildCoreProgressionModules } from '../game/platform/browser/composition/build_core_progression_modules.js';

describe('buildCoreProgressionModules', () => {
  it('sources combat progression systems through public feature capabilities', () => {
    expect(buildCoreProgressionModules()).toEqual({
      DifficultyScaler: hoisted.DifficultyScaler,
      ClassMechanics: hoisted.ClassMechanics,
      SetBonusSystem: hoisted.SetBonusSystem,
    });
  });
});
