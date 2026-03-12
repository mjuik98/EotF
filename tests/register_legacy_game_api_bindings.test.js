import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  assignLegacyCompatSurface: vi.fn(),
  buildLegacyGameAPICommandBindings: vi.fn(),
  buildLegacyGameAPIQueryBindings: vi.fn(),
  buildLegacyGameApiPayload: vi.fn(),
  createLegacyGameApi: vi.fn(),
}));

vi.mock('../game/platform/legacy/game_api_command_bindings.js', () => ({
  buildLegacyGameAPICommandBindings: hoisted.buildLegacyGameAPICommandBindings,
}));

vi.mock('../game/platform/legacy/game_api_query_bindings.js', () => ({
  buildLegacyGameAPIQueryBindings: hoisted.buildLegacyGameAPIQueryBindings,
}));

vi.mock('../game/platform/legacy/build_legacy_game_api_payload.js', () => ({
  buildLegacyGameApiPayload: hoisted.buildLegacyGameApiPayload,
}));

vi.mock('../game/platform/legacy/create_legacy_game_api.js', () => ({
  createLegacyGameApi: hoisted.createLegacyGameApi,
}));

vi.mock('../game/shared/runtime/public.js', () => ({
  assignLegacyCompatSurface: hoisted.assignLegacyCompatSurface,
}));

import { registerLegacyGameAPIBindings } from '../game/platform/legacy/game_api_registry.js';

describe('registerLegacyGameAPIBindings', () => {
  beforeEach(() => {
    Object.values(hoisted).forEach((fn) => fn.mockReset());
  });

  it('builds command/query bindings, maps them into an API payload, and assigns the compat surface', () => {
    const modules = { GAME: { API: {} } };
    const fns = { startGame: vi.fn() };
    const deps = { token: 'deps' };
    const runtimeMetrics = { getRuntimeMetrics: vi.fn() };
    const commandBindings = { startGame: vi.fn() };
    const queryBindings = { getRuntimeMetrics: vi.fn() };
    const apiPayload = { runActions: { startGame: commandBindings.startGame } };
    const api = { startGame: commandBindings.startGame };

    hoisted.buildLegacyGameAPICommandBindings.mockReturnValue(commandBindings);
    hoisted.buildLegacyGameAPIQueryBindings.mockReturnValue(queryBindings);
    hoisted.buildLegacyGameApiPayload.mockReturnValue(apiPayload);
    hoisted.createLegacyGameApi.mockReturnValue(api);
    hoisted.assignLegacyCompatSurface.mockImplementation((target, nextApi) => {
      Object.assign(target, nextApi);
      return target;
    });

    registerLegacyGameAPIBindings(modules, fns, deps, runtimeMetrics);

    expect(hoisted.buildLegacyGameAPICommandBindings).toHaveBeenCalledWith(modules, fns);
    expect(hoisted.buildLegacyGameAPIQueryBindings).toHaveBeenCalledWith(
      modules,
      deps,
      runtimeMetrics,
    );
    expect(hoisted.buildLegacyGameApiPayload).toHaveBeenCalledWith({
      commandBindings,
      queryBindings,
    });
    expect(hoisted.createLegacyGameApi).toHaveBeenCalledWith(apiPayload);
    expect(hoisted.assignLegacyCompatSurface).toHaveBeenCalledWith(modules.GAME.API, api);
    expect(modules.GAME.API).toMatchObject(api);
  });
});
