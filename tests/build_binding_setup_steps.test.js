import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  registerBootstrapBindings: vi.fn(),
}));

vi.mock('../game/core/bootstrap/register_bootstrap_bindings.js', () => ({
  registerBootstrapBindings: hoisted.registerBootstrapBindings,
}));

import { buildBindingSetupSteps } from '../game/core/bootstrap/build_binding_setup_steps.js';

describe('buildBindingSetupSteps', () => {
  beforeEach(() => {
    hoisted.registerBootstrapBindings.mockReset();
  });

  it('builds the binding setup step sequence in order', () => {
    const modules = { id: 'modules' };
    const fns = { id: 'fns' };
    const deps = { id: 'deps' };
    const steps = buildBindingSetupSteps();

    expect(steps).toHaveLength(1);

    steps[0]({ modules, fns, deps });

    expect(hoisted.registerBootstrapBindings).toHaveBeenCalledWith({ modules, fns, deps });
  });
});
