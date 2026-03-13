import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  SaveSystem: { id: 'save-system' },
  bindSaveStorage: vi.fn(),
  RunRules: { id: 'run-rules' },
  createFinalizeRunOutcomeAction: vi.fn((saveSystem) => ({ saveSystem, kind: 'bound' })),
  getBaseRegionIndex: vi.fn(() => 1),
  getRegionCount: vi.fn(() => 3),
  getRegionData: vi.fn(() => ({ id: 'region-1' })),
}));

vi.mock('../game/shared/save/public.js', () => ({
  bindSaveStorage: hoisted.bindSaveStorage,
  SaveSystem: hoisted.SaveSystem,
}));

vi.mock('../game/features/run/public.js', () => ({
  RunRules: hoisted.RunRules,
  createFinalizeRunOutcomeAction: hoisted.createFinalizeRunOutcomeAction,
  getBaseRegionIndex: hoisted.getBaseRegionIndex,
  getRegionCount: hoisted.getRegionCount,
  getRegionData: hoisted.getRegionData,
}));

import { buildCoreRunSystemModules } from '../game/platform/browser/composition/build_core_run_system_modules.js';

describe('buildCoreRunSystemModules', () => {
  it('builds the run module group through public feature capabilities only', () => {
    const modules = buildCoreRunSystemModules();

    expect(hoisted.bindSaveStorage).toHaveBeenCalledTimes(1);
    expect(hoisted.createFinalizeRunOutcomeAction).toHaveBeenCalledWith(
      hoisted.SaveSystem,
      expect.any(Function),
    );
    expect(modules).toEqual({
      SaveSystem: hoisted.SaveSystem,
      RunRules: hoisted.RunRules,
      getRegionData: hoisted.getRegionData,
      getBaseRegionIndex: hoisted.getBaseRegionIndex,
      getRegionCount: hoisted.getRegionCount,
      finalizeRunOutcome: { saveSystem: hoisted.SaveSystem, kind: 'bound' },
    });
  });
});
