import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildGameBindingRegistrarGroups: vi.fn(),
  groups: {
    gameplay: [vi.fn(), vi.fn(), vi.fn()],
    shell: [vi.fn(), vi.fn()],
  },
}));

vi.mock('../game/core/composition/build_game_binding_registrar_groups.js', () => ({
  buildGameBindingRegistrarGroups: hoisted.buildGameBindingRegistrarGroups,
}));

import { buildGameBindingRegistrars } from '../game/core/composition/build_game_binding_registrars.js';

describe('buildGameBindingRegistrars', () => {
  beforeEach(() => {
    hoisted.buildGameBindingRegistrarGroups.mockReset();
    hoisted.groups.gameplay.forEach((registrar) => registrar.mockReset());
    hoisted.groups.shell.forEach((registrar) => registrar.mockReset());
    hoisted.buildGameBindingRegistrarGroups.mockReturnValue(hoisted.groups);
  });

  it('flattens registrar groups in gameplay-to-shell order', () => {
    expect(buildGameBindingRegistrars()).toEqual([
      ...hoisted.groups.gameplay,
      ...hoisted.groups.shell,
    ]);
    expect(hoisted.buildGameBindingRegistrarGroups).toHaveBeenCalledTimes(1);
  });
});
