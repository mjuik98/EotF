import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildGameBindingRegistrars: vi.fn(),
  executeGameBindingRegistrars: vi.fn(),
  registrars: [vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn()],
}));

vi.mock('../game/core/composition/build_game_binding_registrars.js', () => ({
  buildGameBindingRegistrars: hoisted.buildGameBindingRegistrars,
}));

vi.mock('../game/core/composition/execute_game_binding_registrars.js', () => ({
  executeGameBindingRegistrars: hoisted.executeGameBindingRegistrars,
}));

import { registerGameBindings } from '../game/core/composition/register_game_bindings.js';

describe('registerGameBindings', () => {
  beforeEach(() => {
    hoisted.buildGameBindingRegistrars.mockReset();
    hoisted.executeGameBindingRegistrars.mockReset();
    hoisted.registrars.forEach((registrar) => registrar.mockReset());
    hoisted.buildGameBindingRegistrars.mockReturnValue(hoisted.registrars);
  });

  it('builds registrars and delegates execution to the orchestration helper', () => {
    const modules = { GAME: {} };
    const fns = {};

    const result = registerGameBindings(modules, fns);

    expect(hoisted.buildGameBindingRegistrars).toHaveBeenCalledTimes(1);
    expect(hoisted.executeGameBindingRegistrars).toHaveBeenCalledWith(modules, fns, hoisted.registrars);
    expect(result).toBe(fns);
  });
});
