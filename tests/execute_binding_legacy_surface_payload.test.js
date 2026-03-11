import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  executeBindingLegacySurfaceSteps: vi.fn(),
}));

vi.mock('../game/core/bootstrap/execute_binding_legacy_surface_steps.js', () => ({
  executeBindingLegacySurfaceSteps: hoisted.executeBindingLegacySurfaceSteps,
}));

import { executeBindingLegacySurfacePayload } from '../game/core/bootstrap/execute_binding_legacy_surface_payload.js';

describe('executeBindingLegacySurfacePayload', () => {
  beforeEach(() => {
    hoisted.executeBindingLegacySurfaceSteps.mockReset();
  });

  it('executes the payload context and steps through the step executor', () => {
    const context = { id: 'context' };
    const steps = [vi.fn()];

    executeBindingLegacySurfacePayload({ context, steps });

    expect(hoisted.executeBindingLegacySurfaceSteps).toHaveBeenCalledWith(context, steps);
  });
});
