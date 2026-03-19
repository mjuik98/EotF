import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  assignLegacyCompatSurface: vi.fn(),
  buildLegacyGameApiRegistrationPayload: vi.fn(),
  createLegacyGameApi: vi.fn(),
}));

vi.mock('../game/platform/legacy/build_legacy_game_api_registration_payload.js', () => ({
  buildLegacyGameApiRegistrationPayload: hoisted.buildLegacyGameApiRegistrationPayload,
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

  it('builds a grouped registration payload and assigns the compat surface', () => {
    const apiRoot = {};
    const modules = {
      GAME: { API: { stale: true } },
      legacyModules: {
        GAME: { API: apiRoot },
      },
    };
    const fns = { startGame: vi.fn() };
    const deps = { token: 'deps' };
    const runtimeMetrics = { getRuntimeMetrics: vi.fn() };
    const apiPayload = { runActions: { startGame: vi.fn() } };
    const api = { startGame: apiPayload.runActions.startGame };

    hoisted.buildLegacyGameApiRegistrationPayload.mockReturnValue({ apiPayload });
    hoisted.createLegacyGameApi.mockReturnValue(api);
    hoisted.assignLegacyCompatSurface.mockImplementation((target, nextApi) => {
      Object.assign(target, nextApi);
      return target;
    });

    registerLegacyGameAPIBindings(modules, fns, deps, runtimeMetrics);

    expect(hoisted.buildLegacyGameApiRegistrationPayload).toHaveBeenCalledWith({
      modules,
      fns,
      deps,
      runtimeMetrics,
    });
    expect(hoisted.createLegacyGameApi).toHaveBeenCalledWith(apiPayload);
    expect(hoisted.assignLegacyCompatSurface).toHaveBeenCalledWith(apiRoot, api);
    expect(apiRoot).toMatchObject(api);
  });
});
