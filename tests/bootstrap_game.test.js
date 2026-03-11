import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  createModuleRegistry: vi.fn(),
  setupBindings: vi.fn(),
  bootGame: vi.fn(),
  cursorInit: vi.fn(),
}));

vi.mock('../game/core/bindings/module_registry.js', () => ({
  createModuleRegistry: hoisted.createModuleRegistry,
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
    hoisted.setupBindings.mockReset();
    hoisted.bootGame.mockReset();
    hoisted.cursorInit.mockReset();
  });

  it('creates modules, initializes cursor, wires bindings, and boots the game', () => {
    const modules = { GAME: {}, CustomCursor: { init: hoisted.cursorInit } };
    const fns = { updateNextNodes: vi.fn() };
    const doc = { body: {} };
    const win = { location: {} };

    hoisted.createModuleRegistry.mockReturnValue(modules);
    hoisted.setupBindings.mockReturnValue(fns);

    const result = bootstrapGameApp({ doc, win });

    expect(hoisted.createModuleRegistry).toHaveBeenCalledTimes(1);
    expect(hoisted.cursorInit).toHaveBeenCalledWith({ doc, win });
    expect(hoisted.setupBindings).toHaveBeenCalledWith(modules);
    expect(hoisted.bootGame).toHaveBeenCalledWith(modules, fns, Deps);
    expect(result).toEqual({ modules, fns });
  });

  it('continues boot even if CustomCursor init fails', () => {
    const modules = { GAME: {}, CustomCursor: { init: hoisted.cursorInit } };
    const fns = { updateNextNodes: vi.fn() };
    const doc = { body: {} };
    const win = { location: {} };
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    hoisted.createModuleRegistry.mockReturnValue(modules);
    hoisted.setupBindings.mockReturnValue(fns);
    hoisted.cursorInit.mockImplementation(() => {
      throw new Error('cursor fail');
    });

    bootstrapGameApp({ doc, win });

    expect(hoisted.setupBindings).toHaveBeenCalledWith(modules);
    expect(hoisted.bootGame).toHaveBeenCalledWith(modules, fns, Deps);
    expect(errSpy).toHaveBeenCalled();
  });
});
