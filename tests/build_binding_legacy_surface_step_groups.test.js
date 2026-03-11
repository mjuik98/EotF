import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  attachLegacyWindowBindings: vi.fn(),
  registerLegacyGameAPIBindings: vi.fn(),
  registerLegacyGameModules: vi.fn(),
}));

vi.mock('../game/platform/legacy/window_bindings.js', () => ({
  attachLegacyWindowBindings: hoisted.attachLegacyWindowBindings,
}));

vi.mock('../game/platform/legacy/game_api_registry.js', () => ({
  registerLegacyGameAPIBindings: hoisted.registerLegacyGameAPIBindings,
  registerLegacyGameModules: hoisted.registerLegacyGameModules,
}));

import { buildBindingLegacySurfaceStepGroups } from '../game/core/bootstrap/build_binding_legacy_surface_step_groups.js';

describe('buildBindingLegacySurfaceStepGroups', () => {
  beforeEach(() => {
    hoisted.attachLegacyWindowBindings.mockReset();
    hoisted.registerLegacyGameAPIBindings.mockReset();
    hoisted.registerLegacyGameModules.mockReset();
  });

  it('returns grouped legacy surface setup steps', () => {
    const groups = buildBindingLegacySurfaceStepGroups();
    const modules = { id: 'modules' };
    const fns = { id: 'fns' };
    const deps = { id: 'deps' };
    const metrics = { id: 'metrics' };

    expect(groups.window).toHaveLength(1);
    expect(groups.api).toHaveLength(1);
    expect(groups.modules).toHaveLength(1);

    groups.window[0]({ modules, fns, deps });
    groups.api[0]({ modules, fns, deps, metrics });
    groups.modules[0]({ modules });

    expect(hoisted.attachLegacyWindowBindings).toHaveBeenCalledWith(modules, fns, deps);
    expect(hoisted.registerLegacyGameAPIBindings).toHaveBeenCalledWith(
      modules,
      fns,
      deps,
      metrics,
    );
    expect(hoisted.registerLegacyGameModules).toHaveBeenCalledWith(modules);
  });
});
