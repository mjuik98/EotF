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

import { buildBindingSetupStepGroups } from '../game/core/bootstrap/build_binding_setup_step_groups.js';

describe('buildBindingSetupStepGroups', () => {
  beforeEach(() => {
    hoisted.registerGameBindings.mockReset();
    hoisted.registerBindingLegacySurface.mockReset();
    hoisted.initBindingDeps.mockReset();
  });

  it('builds grouped binding setup steps', () => {
    const modules = { id: 'modules' };
    const fns = { id: 'fns' };
    const deps = { id: 'deps' };
    const groups = buildBindingSetupStepGroups();

    expect(groups.gameplay).toHaveLength(1);
    expect(groups.bootstrap).toHaveLength(2);

    groups.gameplay[0]({ modules, fns, deps });
    groups.bootstrap[0]({ modules, fns, deps });
    groups.bootstrap[1]({ modules, fns, deps });

    expect(hoisted.registerGameBindings).toHaveBeenCalledWith(modules, fns);
    expect(hoisted.registerBindingLegacySurface).toHaveBeenCalledWith({ modules, fns, deps });
    expect(hoisted.initBindingDeps).toHaveBeenCalledWith({ modules, fns, deps });
  });
});
