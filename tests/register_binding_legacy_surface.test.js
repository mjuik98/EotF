import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildBindingLegacySurfacePayload: vi.fn(),
  executeBindingLegacySurfacePayload: vi.fn(),
}));

vi.mock('../game/core/bootstrap/build_binding_legacy_surface_payload.js', () => ({
  buildBindingLegacySurfacePayload: hoisted.buildBindingLegacySurfacePayload,
}));

vi.mock('../game/core/bootstrap/execute_binding_legacy_surface_payload.js', () => ({
  executeBindingLegacySurfacePayload: hoisted.executeBindingLegacySurfacePayload,
}));

import { registerBindingLegacySurface } from '../game/core/bootstrap/register_binding_legacy_surface.js';

describe('registerBindingLegacySurface', () => {
  beforeEach(() => {
    hoisted.buildBindingLegacySurfacePayload.mockReset();
    hoisted.executeBindingLegacySurfacePayload.mockReset();
  });

  it('builds the binding legacy payload and executes it', () => {
    const modules = { GAME: {} };
    const fns = { startGame: vi.fn() };
    const deps = { token: 'deps' };
    const payload = {
      context: { modules, fns, deps, metrics: { id: 'metrics' } },
      steps: [vi.fn()],
    };

    hoisted.buildBindingLegacySurfacePayload.mockReturnValue(payload);

    registerBindingLegacySurface({ modules, fns, deps });

    expect(hoisted.buildBindingLegacySurfacePayload).toHaveBeenCalledWith({ modules, fns, deps });
    expect(hoisted.executeBindingLegacySurfacePayload).toHaveBeenCalledWith(payload);
  });
});
