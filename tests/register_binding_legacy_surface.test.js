import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildBindingLegacyMetrics: vi.fn(),
  buildBindingLegacySurfaceSteps: vi.fn(),
  executeBindingLegacySurfaceSteps: vi.fn(),
}));

vi.mock('../game/core/bootstrap/build_binding_legacy_metrics.js', () => ({
  buildBindingLegacyMetrics: hoisted.buildBindingLegacyMetrics,
}));

vi.mock('../game/core/bootstrap/build_binding_legacy_surface_steps.js', () => ({
  buildBindingLegacySurfaceSteps: hoisted.buildBindingLegacySurfaceSteps,
}));

vi.mock('../game/core/bootstrap/execute_binding_legacy_surface_steps.js', () => ({
  executeBindingLegacySurfaceSteps: hoisted.executeBindingLegacySurfaceSteps,
}));

import { registerBindingLegacySurface } from '../game/core/bootstrap/register_binding_legacy_surface.js';

describe('registerBindingLegacySurface', () => {
  beforeEach(() => {
    hoisted.buildBindingLegacyMetrics.mockReset();
    hoisted.buildBindingLegacySurfaceSteps.mockReset();
    hoisted.executeBindingLegacySurfaceSteps.mockReset();
  });

  it('builds metrics and executes the binding legacy setup steps', () => {
    const modules = { GAME: {} };
    const fns = { startGame: vi.fn() };
    const deps = { token: 'deps' };
    const metrics = { getRuntimeMetrics: vi.fn(), resetRuntimeMetrics: vi.fn() };
    const steps = [vi.fn()];

    hoisted.buildBindingLegacyMetrics.mockReturnValue(metrics);
    hoisted.buildBindingLegacySurfaceSteps.mockReturnValue(steps);

    registerBindingLegacySurface({ modules, fns, deps });

    expect(hoisted.buildBindingLegacyMetrics).toHaveBeenCalledTimes(1);
    expect(hoisted.buildBindingLegacySurfaceSteps).toHaveBeenCalledTimes(1);
    expect(hoisted.executeBindingLegacySurfaceSteps).toHaveBeenCalledWith(
      { modules, fns, deps, metrics },
      steps,
    );
  });
});
