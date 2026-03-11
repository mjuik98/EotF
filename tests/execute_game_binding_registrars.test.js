import { describe, expect, it, vi } from 'vitest';

import { executeGameBindingRegistrars } from '../game/core/composition/execute_game_binding_registrars.js';

describe('executeGameBindingRegistrars', () => {
  it('runs binding registrars in order with shared modules and fns', () => {
    const callOrder = [];
    const modules = { GAME: {} };
    const fns = {};
    const registrars = [
      vi.fn(() => callOrder.push('canvas')),
      vi.fn(() => callOrder.push('combat')),
      vi.fn(() => callOrder.push('title')),
    ];

    executeGameBindingRegistrars(modules, fns, registrars);

    expect(callOrder).toEqual(['canvas', 'combat', 'title']);
    expect(registrars[0]).toHaveBeenCalledWith(modules, fns);
    expect(registrars[1]).toHaveBeenCalledWith(modules, fns);
    expect(registrars[2]).toHaveBeenCalledWith(modules, fns);
  });
});
