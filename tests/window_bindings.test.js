import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  resolveLegacyWindowBindingRoot: vi.fn(),
  buildLegacyWindowBindingSteps: vi.fn(),
  executeLegacyWindowBindingSteps: vi.fn(),
}));

vi.mock('../game/platform/legacy/resolve_legacy_window_binding_root.js', () => ({
  resolveLegacyWindowBindingRoot: hoisted.resolveLegacyWindowBindingRoot,
}));

vi.mock('../game/platform/legacy/build_legacy_window_binding_steps.js', () => ({
  buildLegacyWindowBindingSteps: hoisted.buildLegacyWindowBindingSteps,
}));

vi.mock('../game/platform/legacy/execute_legacy_window_binding_steps.js', () => ({
  executeLegacyWindowBindingSteps: hoisted.executeLegacyWindowBindingSteps,
}));

import { attachLegacyWindowBindings } from '../game/platform/legacy/window_bindings.js';

describe('attachLegacyWindowBindings', () => {
  beforeEach(() => {
    Object.values(hoisted).forEach((fn) => fn.mockReset());
  });

  it('resolves a binding root and executes the window binding steps', () => {
    const root = {};
    const modules = { GAME: {} };
    const fns = { startGame: vi.fn() };
    const deps = { token: 'deps' };
    const steps = [vi.fn()];

    hoisted.resolveLegacyWindowBindingRoot.mockReturnValue(root);
    hoisted.buildLegacyWindowBindingSteps.mockReturnValue(steps);

    attachLegacyWindowBindings(modules, fns, deps);

    expect(hoisted.resolveLegacyWindowBindingRoot).toHaveBeenCalledWith(modules);
    expect(hoisted.buildLegacyWindowBindingSteps).toHaveBeenCalledTimes(1);
    expect(hoisted.executeLegacyWindowBindingSteps).toHaveBeenCalledWith(
      { root, modules, fns, deps },
      steps,
    );
  });

  it('returns early when no root is available', () => {
    hoisted.resolveLegacyWindowBindingRoot.mockReturnValue(null);

    attachLegacyWindowBindings({ GAME: {} }, {}, {});

    expect(hoisted.buildLegacyWindowBindingSteps).not.toHaveBeenCalled();
    expect(hoisted.executeLegacyWindowBindingSteps).not.toHaveBeenCalled();
  });
});
