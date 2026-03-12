import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildLegacyBridgeRegistrationPayload: vi.fn(() => ({ initArgs: {}, globals: {} })),
  executeLegacySurfaceRegistration: vi.fn(),
}));

vi.mock('../game/platform/legacy/build_legacy_bridge_registration_payload.js', () => ({
  buildLegacyBridgeRegistrationPayload: hoisted.buildLegacyBridgeRegistrationPayload,
}));

vi.mock('../game/core/bootstrap/execute_legacy_surface_registration.js', () => ({
  executeLegacySurfaceRegistration: hoisted.executeLegacySurfaceRegistration,
}));

import { registerLegacyBridgeRuntime } from '../game/platform/legacy/register_legacy_bridge_runtime.js';

describe('registerLegacyBridgeRuntime', () => {
  it('registers the composed legacy surface payload through the bootstrap executor', () => {
    const modules = { GAME: {} };
    const fns = { startGame: vi.fn() };

    registerLegacyBridgeRuntime({ modules, fns });

    expect(hoisted.buildLegacyBridgeRegistrationPayload).toHaveBeenCalledWith({ modules, fns });
    expect(hoisted.executeLegacySurfaceRegistration).toHaveBeenCalledWith({
      modules,
      payload: { initArgs: {}, globals: {} },
    });
  });
});
