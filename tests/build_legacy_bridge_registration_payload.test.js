import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildLegacyBridgeInitArgs: vi.fn(() => ({ game: { id: 'game' } })),
  buildLegacySurfaceGlobals: vi.fn(() => ({ startGame: vi.fn() })),
}));

vi.mock('../game/platform/legacy/build_legacy_bridge_init_args.js', () => ({
  buildLegacyBridgeInitArgs: hoisted.buildLegacyBridgeInitArgs,
}));

vi.mock('../game/core/bootstrap/build_legacy_surface_globals.js', () => ({
  buildLegacySurfaceGlobals: hoisted.buildLegacySurfaceGlobals,
}));

import { buildLegacyBridgeRegistrationPayload } from '../game/platform/legacy/build_legacy_bridge_registration_payload.js';

describe('buildLegacyBridgeRegistrationPayload', () => {
  it('assembles legacy bridge payload from init args and global surface builders', () => {
    const modules = { GAME: { id: 'game' } };
    const fns = { startGame: vi.fn() };

    expect(buildLegacyBridgeRegistrationPayload({ modules, fns })).toEqual({
      initArgs: { game: { id: 'game' } },
      globals: expect.any(Object),
    });
    expect(hoisted.buildLegacyBridgeInitArgs).toHaveBeenCalledWith({ modules });
    expect(hoisted.buildLegacySurfaceGlobals).toHaveBeenCalledWith({ modules, fns });
  });
});
