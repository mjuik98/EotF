import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  registerCanvasBindingGroup: vi.fn(),
  registerCombatBindingGroup: vi.fn(),
  registerEventBindingGroup: vi.fn(),
  registerScreenBindingGroup: vi.fn(),
  registerTitleBindingGroup: vi.fn(),
}));

vi.mock('../game/core/composition/register_canvas_binding_group.js', () => ({
  registerCanvasBindingGroup: hoisted.registerCanvasBindingGroup,
}));

vi.mock('../game/core/composition/register_combat_binding_group.js', () => ({
  registerCombatBindingGroup: hoisted.registerCombatBindingGroup,
}));

vi.mock('../game/core/composition/register_event_binding_group.js', () => ({
  registerEventBindingGroup: hoisted.registerEventBindingGroup,
}));

vi.mock('../game/core/composition/register_screen_binding_group.js', () => ({
  registerScreenBindingGroup: hoisted.registerScreenBindingGroup,
}));

vi.mock('../game/core/composition/register_title_binding_group.js', () => ({
  registerTitleBindingGroup: hoisted.registerTitleBindingGroup,
}));

import { registerGameBindings } from '../game/core/composition/register_game_bindings.js';

describe('registerGameBindings', () => {
  beforeEach(() => {
    Object.values(hoisted).forEach((fn) => fn.mockReset());
  });

  it('delegates binding setup to feature binding groups in order', () => {
    const modules = { GAME: {} };
    const fns = {};

    const result = registerGameBindings(modules, fns);

    expect(hoisted.registerCanvasBindingGroup).toHaveBeenCalledWith(modules, fns);
    expect(hoisted.registerCombatBindingGroup).toHaveBeenCalledWith(modules, fns);
    expect(hoisted.registerEventBindingGroup).toHaveBeenCalledWith(modules, fns);
    expect(hoisted.registerScreenBindingGroup).toHaveBeenCalledWith(modules, fns);
    expect(hoisted.registerTitleBindingGroup).toHaveBeenCalledWith(modules, fns);
    expect(result).toBe(fns);
  });
});
