import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  SaveSystem: { id: 'save-system' },
  StoreGS: { token: 'store-gs' },
  bindSaveStorage: vi.fn(),
  bindSaveNotifications: vi.fn(),
  presentSaveStatus: vi.fn(),
  RunRules: { id: 'run-rules' },
  createFinalizeRunOutcomeAction: vi.fn((saveSystem) => ({ saveSystem, kind: 'bound' })),
  getBaseRegionIndex: vi.fn(() => 1),
  getRegionCount: vi.fn(() => 3),
  getRegionData: vi.fn(() => ({ id: 'region-1' })),
}));

vi.mock('../game/shared/save/public.js', () => ({
  bindSaveNotifications: hoisted.bindSaveNotifications,
  bindSaveStorage: hoisted.bindSaveStorage,
  presentSaveStatus: hoisted.presentSaveStatus,
  SaveSystem: hoisted.SaveSystem,
}));

vi.mock('../game/core/store/public.js', () => ({
  GS: hoisted.StoreGS,
}));

vi.mock('../game/features/run/ports/public_system_capabilities.js', () => ({
  createRunSystemCapabilities: vi.fn(() => ({
    rules: {
      RunRules: hoisted.RunRules,
      getBaseRegionIndex: hoisted.getBaseRegionIndex,
      getRegionCount: hoisted.getRegionCount,
      getRegionData: hoisted.getRegionData,
    },
    runtime: {
      createFinalizeOutcomeAction: hoisted.createFinalizeRunOutcomeAction,
    },
  })),
}));

import { buildCoreRunSystemModules } from '../game/platform/browser/composition/build_core_run_system_modules.js';

describe('buildCoreRunSystemModules', () => {
  it('builds the run module group through public feature capabilities only', () => {
    const modules = buildCoreRunSystemModules();

    expect(hoisted.bindSaveStorage).toHaveBeenCalledTimes(1);
    expect(hoisted.bindSaveNotifications).toHaveBeenCalledTimes(1);
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

  it('sources GS from the core store public surface for finalize-outcome wiring', () => {
    buildCoreRunSystemModules();

    const getGs = hoisted.createFinalizeRunOutcomeAction.mock.calls.at(-1)?.[1];
    expect(getGs?.()).toBe(hoisted.StoreGS);
  });
});
