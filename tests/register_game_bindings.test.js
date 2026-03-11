import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildGameBindingRegistrars: vi.fn(),
  registerCanvasBindingGroup: vi.fn(),
  registerCombatBindingGroup: vi.fn(),
  registerEventBindingGroup: vi.fn(),
  registerScreenBindingGroup: vi.fn(),
  registerTitleBindingGroup: vi.fn(),
}));

vi.mock('../game/core/composition/build_game_binding_registrars.js', () => ({
  buildGameBindingRegistrars: hoisted.buildGameBindingRegistrars,
}));

import { registerGameBindings } from '../game/core/composition/register_game_bindings.js';

describe('registerGameBindings', () => {
  beforeEach(() => {
    Object.values(hoisted).forEach((fn) => fn.mockReset());
    hoisted.buildGameBindingRegistrars.mockReturnValue([
      hoisted.registerCanvasBindingGroup,
      hoisted.registerCombatBindingGroup,
      hoisted.registerEventBindingGroup,
      hoisted.registerScreenBindingGroup,
      hoisted.registerTitleBindingGroup,
    ]);
  });

  it('delegates binding setup to feature binding groups in order', () => {
    const modules = { GAME: {} };
    const fns = {};

    const result = registerGameBindings(modules, fns);

    expect(hoisted.buildGameBindingRegistrars).toHaveBeenCalledTimes(1);
    expect(hoisted.registerCanvasBindingGroup).toHaveBeenCalledWith(modules, fns);
    expect(hoisted.registerCombatBindingGroup).toHaveBeenCalledWith(modules, fns);
    expect(hoisted.registerEventBindingGroup).toHaveBeenCalledWith(modules, fns);
    expect(hoisted.registerScreenBindingGroup).toHaveBeenCalledWith(modules, fns);
    expect(hoisted.registerTitleBindingGroup).toHaveBeenCalledWith(modules, fns);
    expect(result).toBe(fns);
  });
});
