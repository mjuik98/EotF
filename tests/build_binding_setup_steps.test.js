import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  registerGameBindings: vi.fn(),
  registerBindingLegacySurface: vi.fn(),
  initBindingDeps: vi.fn(),
}));

vi.mock('../game/core/composition/register_game_bindings.js', () => ({
  registerGameBindings: hoisted.registerGameBindings,
}));

vi.mock('../game/core/bootstrap/register_binding_legacy_surface.js', () => ({
  registerBindingLegacySurface: hoisted.registerBindingLegacySurface,
}));

vi.mock('../game/core/bootstrap/init_binding_deps.js', () => ({
  initBindingDeps: hoisted.initBindingDeps,
}));

import { buildBindingSetupSteps } from '../game/core/bootstrap/build_binding_setup_steps.js';

describe('buildBindingSetupSteps', () => {
  beforeEach(() => {
    hoisted.registerGameBindings.mockReset();
    hoisted.registerBindingLegacySurface.mockReset();
    hoisted.initBindingDeps.mockReset();
  });

  it('builds the binding setup step sequence in order', () => {
    const modules = { id: 'modules' };
    const fns = { id: 'fns' };
    const deps = { id: 'deps' };
    const steps = buildBindingSetupSteps();

    expect(steps).toHaveLength(3);

    steps[0]({ modules, fns, deps });
    steps[1]({ modules, fns, deps });
    steps[2]({ modules, fns, deps });

    expect(hoisted.registerGameBindings).toHaveBeenCalledWith(modules, fns);
    expect(hoisted.registerBindingLegacySurface).toHaveBeenCalledWith({ modules, fns, deps });
    expect(hoisted.initBindingDeps).toHaveBeenCalledWith({ modules, fns, deps });
  });
});
