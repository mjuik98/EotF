import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildBindingLegacyMetrics: vi.fn(),
  buildBindingLegacySurfaceSteps: vi.fn(),
}));

vi.mock('../game/core/bootstrap/build_binding_legacy_metrics.js', () => ({
  buildBindingLegacyMetrics: hoisted.buildBindingLegacyMetrics,
}));

vi.mock('../game/core/bootstrap/build_binding_legacy_surface_steps.js', () => ({
  buildBindingLegacySurfaceSteps: hoisted.buildBindingLegacySurfaceSteps,
}));

import { buildBindingLegacySurfacePayload } from '../game/core/bootstrap/build_binding_legacy_surface_payload.js';

describe('buildBindingLegacySurfacePayload', () => {
  beforeEach(() => {
    hoisted.buildBindingLegacyMetrics.mockReset();
    hoisted.buildBindingLegacySurfaceSteps.mockReset();
  });

  it('builds binding legacy context and steps payload', () => {
    const modules = { id: 'modules' };
    const fns = { id: 'fns' };
    const deps = { id: 'deps' };
    const metrics = { id: 'metrics' };
    const steps = [vi.fn()];

    hoisted.buildBindingLegacyMetrics.mockReturnValue(metrics);
    hoisted.buildBindingLegacySurfaceSteps.mockReturnValue(steps);

    expect(buildBindingLegacySurfacePayload({ modules, fns, deps })).toEqual({
      context: { modules, fns, deps, metrics },
      steps,
    });
  });
});
