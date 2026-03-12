import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildLegacyWindowBindingPayload: vi.fn(),
  executeLegacyWindowBindingSteps: vi.fn(),
}));

vi.mock('../game/platform/legacy/build_legacy_window_binding_payload.js', () => ({
  buildLegacyWindowBindingPayload: hoisted.buildLegacyWindowBindingPayload,
}));

vi.mock('../game/platform/legacy/execute_legacy_window_binding_steps.js', () => ({
  executeLegacyWindowBindingSteps: hoisted.executeLegacyWindowBindingSteps,
}));

import { attachLegacyWindowBindings } from '../game/platform/legacy/window_bindings.js';

describe('attachLegacyWindowBindings', () => {
  beforeEach(() => {
    Object.values(hoisted).forEach((fn) => fn.mockReset());
  });

  it('builds a binding payload and executes the window binding steps', () => {
    const root = {};
    const modules = { GAME: {} };
    const fns = { startGame: vi.fn() };
    const deps = { token: 'deps' };
    const steps = [vi.fn()];

    hoisted.buildLegacyWindowBindingPayload.mockReturnValue({
      context: { root, modules, fns, deps },
      steps,
    });

    attachLegacyWindowBindings(modules, fns, deps);

    expect(hoisted.buildLegacyWindowBindingPayload).toHaveBeenCalledWith({ modules, fns, deps });
    expect(hoisted.executeLegacyWindowBindingSteps).toHaveBeenCalledWith(
      { root, modules, fns, deps },
      steps,
    );
  });

  it('returns early when no root is available', () => {
    hoisted.buildLegacyWindowBindingPayload.mockReturnValue(null);

    attachLegacyWindowBindings({ GAME: {} }, {}, {});

    expect(hoisted.executeLegacyWindowBindingSteps).not.toHaveBeenCalled();
  });
});
