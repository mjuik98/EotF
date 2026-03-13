import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  registerBootstrapBindings: vi.fn(),
}));

vi.mock('../game/core/bootstrap/register_bootstrap_bindings.js', () => ({
  registerBootstrapBindings: hoisted.registerBootstrapBindings,
}));

import { buildBindingSetupStepGroups } from '../game/core/bootstrap/build_binding_setup_step_groups.js';

describe('buildBindingSetupStepGroups', () => {
  beforeEach(() => {
    hoisted.registerBootstrapBindings.mockReset();
  });

  it('builds grouped binding setup steps', () => {
    const modules = { id: 'modules' };
    const fns = { id: 'fns' };
    const deps = { id: 'deps' };
    const groups = buildBindingSetupStepGroups();

    expect(groups.gameplay).toHaveLength(1);
    expect(groups.bootstrap).toHaveLength(0);

    groups.gameplay[0]({ modules, fns, deps });

    expect(hoisted.registerBootstrapBindings).toHaveBeenCalledWith({ modules, fns, deps });
  });
});
