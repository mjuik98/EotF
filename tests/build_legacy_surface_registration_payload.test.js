import { describe, expect, it, vi } from 'vitest';

import { buildLegacySurfaceRegistrationPayload } from '../game/core/bootstrap/build_legacy_surface_registration_payload.js';

describe('buildLegacySurfaceRegistrationPayload', () => {
  it('builds init args and globals for legacy surface registration', () => {
    const modules = {
      GS: { id: 'gs' },
      DATA: { id: 'data' },
      AudioEngine: { id: 'audio' },
      ParticleSystem: { id: 'particles' },
      GAME: {},
      exposeGlobals: vi.fn(),
    };
    const fns = { startGame: vi.fn() };

    const payload = buildLegacySurfaceRegistrationPayload({ modules, fns });

    expect(payload.initArgs).toEqual([
      modules.GS,
      modules.DATA,
      modules.AudioEngine,
      modules.ParticleSystem,
    ]);
    expect(payload.globals).toEqual(expect.objectContaining({
      startGame: fns.startGame,
    }));
  });
});
