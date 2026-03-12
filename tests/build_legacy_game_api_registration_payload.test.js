import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildLegacyGameAPICommandBindings: vi.fn(),
  buildLegacyGameAPIQueryBindings: vi.fn(),
  buildLegacyGameApiPayload: vi.fn(),
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

import { buildLegacyGameApiRegistrationPayload } from '../game/platform/legacy/build_legacy_game_api_registration_payload.js';

describe('buildLegacyGameApiRegistrationPayload', () => {
  beforeEach(() => {
    Object.values(hoisted).forEach((fn) => fn.mockReset());
  });

  it('assembles command/query bindings into a legacy API registration payload', () => {
    const modules = { GAME: { API: {} } };
    const fns = { startGame: vi.fn() };
    const deps = { token: 'deps' };
    const runtimeMetrics = { getRuntimeMetrics: vi.fn() };
    const commandBindings = { startGame: vi.fn() };
    const queryBindings = { getRuntimeMetrics: vi.fn() };
    const apiPayload = { runActions: { startGame: commandBindings.startGame } };

    hoisted.buildLegacyGameAPICommandBindings.mockReturnValue(commandBindings);
    hoisted.buildLegacyGameAPIQueryBindings.mockReturnValue(queryBindings);
    hoisted.buildLegacyGameApiPayload.mockReturnValue(apiPayload);

    expect(buildLegacyGameApiRegistrationPayload({
      modules,
      fns,
      deps,
      runtimeMetrics,
    })).toEqual({
      commandBindings,
      queryBindings,
      apiPayload,
    });
  });
});
