import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  createDeps: vi.fn(),
  createDepsAccessors: vi.fn((contractMap, createDeps) => ({
    getRunSetupDeps: (overrides = {}) => ({
      ...createDeps(contractMap.getRunSetupDeps),
      ...overrides,
    }),
  })),
  getRunSetupDeps: vi.fn(),
}));

vi.mock('../game/core/deps_factory.js', () => ({
  createDeps: hoisted.createDeps,
  createDepsAccessors: hoisted.createDepsAccessors,
  getRunSetupDeps: hoisted.getRunSetupDeps,
}));

import { buildLegacyGameAPIRunBindings } from '../game/platform/legacy/game_api_run_bindings.js';

describe('buildLegacyGameAPIRunBindings', () => {
  it('prefers the run setup contract for startGame when available', () => {
    const startGame = vi.fn();
    hoisted.createDeps.mockReturnValue({ startGame });
    const fns = {
      refreshRunModePanel: vi.fn(),
      startGame: vi.fn(),
      showWorldMemoryNotice: vi.fn(),
      selectFragment: vi.fn(),
      shiftAscension: vi.fn(),
    };

    const bindings = buildLegacyGameAPIRunBindings({}, fns);
    bindings.startGame({ fromTitle: true });

    expect(startGame).toHaveBeenCalledWith({ fromTitle: true });
    expect(fns.startGame).not.toHaveBeenCalled();
    expect(hoisted.createDeps).toHaveBeenCalledWith('runSetup');
  });

  it('falls back to the legacy startGame binding when the contract is unavailable', () => {
    hoisted.createDeps.mockImplementation(() => {
      throw new Error('deps unavailable');
    });
    const fns = {
      refreshRunModePanel: vi.fn(),
      startGame: vi.fn(),
      showWorldMemoryNotice: vi.fn(),
      selectFragment: vi.fn(),
      shiftAscension: vi.fn(),
    };

    const bindings = buildLegacyGameAPIRunBindings({}, fns);
    bindings.startGame({ fromTitle: true });

    expect(fns.startGame).toHaveBeenCalledWith({ fromTitle: true });
  });
});
