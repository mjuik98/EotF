import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  createModuleRegistry: vi.fn(),
  createBootstrapContext: vi.fn(),
  initBootstrapCursor: vi.fn(),
  setupBindings: vi.fn(),
  bootGame: vi.fn(),
}));

vi.mock('../game/core/bindings/module_registry.js', () => ({
  createModuleRegistry: hoisted.createModuleRegistry,
}));

vi.mock('../game/core/bootstrap/create_bootstrap_context.js', () => ({
  createBootstrapContext: hoisted.createBootstrapContext,
}));

vi.mock('../game/core/bootstrap/init_bootstrap_cursor.js', () => ({
  initBootstrapCursor: hoisted.initBootstrapCursor,
}));

vi.mock('../game/core/event_bindings.js', () => ({
  setupBindings: hoisted.setupBindings,
}));

vi.mock('../game/core/init_sequence.js', () => ({
  bootGame: hoisted.bootGame,
}));

import * as Deps from '../game/core/deps_factory.js';
import { bootstrapGameApp } from '../game/core/bootstrap_game.js';

describe('bootstrapGameApp', () => {
  beforeEach(() => {
    hoisted.createModuleRegistry.mockReset();
    hoisted.createBootstrapContext.mockReset();
    hoisted.initBootstrapCursor.mockReset();
    hoisted.setupBindings.mockReset();
    hoisted.bootGame.mockReset();
  });

  it('creates modules, initializes cursor, wires bindings, and boots the game', () => {
    const modules = { GAME: {}, CustomCursor: {} };
    const fns = { updateNextNodes: vi.fn() };
    const doc = { body: {} };
    const win = { location: {} };
    const context = { doc, win, deps: Deps, modules };

    hoisted.createBootstrapContext.mockReturnValue(context);
    hoisted.setupBindings.mockReturnValue(fns);

    const result = bootstrapGameApp({ doc, win });

    expect(hoisted.createBootstrapContext).toHaveBeenCalledWith(
      { doc, win },
      { depsFactory: Deps, createModuleRegistry: hoisted.createModuleRegistry },
    );
    expect(hoisted.initBootstrapCursor).toHaveBeenCalledWith({ modules, doc, win });
    expect(hoisted.setupBindings).toHaveBeenCalledWith(modules);
    expect(hoisted.bootGame).toHaveBeenCalledWith(modules, fns, Deps);
    expect(result).toEqual({ modules, fns });
  });

  it('continues boot with the resolved bootstrap context', () => {
    const modules = { GAME: {}, CustomCursor: {} };
    const fns = { updateNextNodes: vi.fn() };
    const doc = { body: {} };
    const win = { location: {} };
    const deps = { token: 'deps' };

    hoisted.createBootstrapContext.mockReturnValue({ doc, win, deps, modules });
    hoisted.setupBindings.mockReturnValue(fns);

    bootstrapGameApp({ doc, win });

    expect(hoisted.initBootstrapCursor).toHaveBeenCalledWith({ modules, doc, win });
    expect(hoisted.setupBindings).toHaveBeenCalledWith(modules);
    expect(hoisted.bootGame).toHaveBeenCalledWith(modules, fns, deps);
  });
});
