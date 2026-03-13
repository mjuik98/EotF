import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  createBootstrapEntry: vi.fn(),
  registerBootstrapBindings: vi.fn(),
  initBootstrapRuntime: vi.fn(),
}));

vi.mock('../game/core/bootstrap/create_bootstrap_entry.js', () => ({
  createBootstrapEntry: hoisted.createBootstrapEntry,
}));

vi.mock('../game/core/bootstrap/register_bootstrap_bindings.js', () => ({
  registerBootstrapBindings: hoisted.registerBootstrapBindings,
}));

vi.mock('../game/core/bootstrap/init_bootstrap_runtime.js', () => ({
  initBootstrapRuntime: hoisted.initBootstrapRuntime,
}));

import * as Deps from '../game/core/deps_factory.js';
import { bootstrapGameApp } from '../game/core/bootstrap_game.js';

describe('bootstrapGameApp', () => {
  beforeEach(() => {
    hoisted.createBootstrapEntry.mockReset();
    hoisted.registerBootstrapBindings.mockReset();
    hoisted.initBootstrapRuntime.mockReset();
  });

  it('creates bootstrap entry, registers bindings, and initializes runtime', () => {
    const modules = { GAME: {}, CustomCursor: {} };
    const fns = { updateNextNodes: vi.fn() };
    const doc = { body: {} };
    const win = { location: {} };
    const context = { doc, win, deps: Deps, modules, fns };

    hoisted.createBootstrapEntry.mockReturnValue(context);

    const result = bootstrapGameApp({ doc, win });

    expect(hoisted.createBootstrapEntry).toHaveBeenCalledWith(
      { doc, win },
      { depsFactory: Deps },
    );
    expect(hoisted.registerBootstrapBindings).toHaveBeenCalledWith(context);
    expect(hoisted.initBootstrapRuntime).toHaveBeenCalledWith(context);
    expect(result).toEqual({ modules, fns });
  });

  it('continues boot with the resolved bootstrap context', () => {
    const modules = { GAME: {}, CustomCursor: {} };
    const fns = { updateNextNodes: vi.fn() };
    const doc = { body: {} };
    const win = { location: {} };
    const deps = { token: 'deps' };

    hoisted.createBootstrapEntry.mockReturnValue({ doc, win, deps, modules, fns });

    bootstrapGameApp({ doc, win });

    expect(hoisted.registerBootstrapBindings).toHaveBeenCalledWith({ doc, win, deps, modules, fns });
    expect(hoisted.initBootstrapRuntime).toHaveBeenCalledWith({ doc, win, deps, modules, fns });
  });
});
