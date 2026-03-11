import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildCoreProgressionModules: vi.fn(() => ({
    DifficultyScaler: { id: 'difficulty' },
    ClassMechanics: { id: 'class' },
  })),
  buildCoreRunSystemModules: vi.fn(() => ({
    RunRules: { id: 'rules' },
    SaveSystem: { id: 'save' },
  })),
  buildCoreUtilityModules: vi.fn(() => ({
    RandomUtils: { id: 'random' },
    CardCostUtils: { id: 'cost' },
  })),
}));

vi.mock('../game/platform/browser/composition/build_core_progression_modules.js', () => ({
  buildCoreProgressionModules: hoisted.buildCoreProgressionModules,
}));

vi.mock('../game/platform/browser/composition/build_core_run_system_modules.js', () => ({
  buildCoreRunSystemModules: hoisted.buildCoreRunSystemModules,
}));

vi.mock('../game/platform/browser/composition/build_core_utility_modules.js', () => ({
  buildCoreUtilityModules: hoisted.buildCoreUtilityModules,
}));

import { buildCoreSystemModules } from '../game/platform/browser/composition/build_core_system_modules.js';

describe('buildCoreSystemModules', () => {
  it('merges progression, run-system, and utility groups', () => {
    const modules = buildCoreSystemModules();

    expect(hoisted.buildCoreProgressionModules).toHaveBeenCalledTimes(1);
    expect(hoisted.buildCoreRunSystemModules).toHaveBeenCalledTimes(1);
    expect(hoisted.buildCoreUtilityModules).toHaveBeenCalledTimes(1);
    expect(modules).toEqual({
      DifficultyScaler: { id: 'difficulty' },
      ClassMechanics: { id: 'class' },
      RunRules: { id: 'rules' },
      SaveSystem: { id: 'save' },
      RandomUtils: { id: 'random' },
      CardCostUtils: { id: 'cost' },
    });
  });
});
