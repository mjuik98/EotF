import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  resolveLegacyWindowBindingRoot: vi.fn(),
  buildLegacyWindowBindingSteps: vi.fn(),
}));

vi.mock('../game/platform/legacy/resolve_legacy_window_binding_root.js', () => ({
  resolveLegacyWindowBindingRoot: hoisted.resolveLegacyWindowBindingRoot,
}));

vi.mock('../game/platform/legacy/build_legacy_window_binding_steps.js', () => ({
  buildLegacyWindowBindingSteps: hoisted.buildLegacyWindowBindingSteps,
}));

import { buildLegacyWindowBindingPayload } from '../game/platform/legacy/build_legacy_window_binding_payload.js';

describe('buildLegacyWindowBindingPayload', () => {
  beforeEach(() => {
    Object.values(hoisted).forEach((fn) => fn.mockReset());
  });

  it('builds the root/context and window binding steps together', () => {
    const root = {};
    const modules = { GAME: {} };
    const fns = { startGame: vi.fn() };
    const deps = { token: 'deps' };
    const steps = [vi.fn()];

    hoisted.resolveLegacyWindowBindingRoot.mockReturnValue(root);
    hoisted.buildLegacyWindowBindingSteps.mockReturnValue(steps);

    expect(buildLegacyWindowBindingPayload({ modules, fns, deps })).toEqual({
      context: { root, modules, fns, deps },
      steps,
    });
  });

  it('returns null when no window binding root is available', () => {
    hoisted.resolveLegacyWindowBindingRoot.mockReturnValue(null);

    expect(buildLegacyWindowBindingPayload({ modules: { GAME: {} } })).toBeNull();
    expect(hoisted.buildLegacyWindowBindingSteps).not.toHaveBeenCalled();
  });
});
