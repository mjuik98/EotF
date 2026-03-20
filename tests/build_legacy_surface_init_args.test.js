import { describe, expect, it } from 'vitest';

import { buildLegacySurfaceInitArgs } from '../game/core/bootstrap/build_legacy_surface_init_args.js';

describe('buildLegacySurfaceInitArgs', () => {
  it('builds the legacy bootstrap init args in order', () => {
    const modules = {
      GS: { id: 'gs' },
      DATA: { id: 'data' },
      AudioEngine: { id: 'audio' },
      ParticleSystem: { id: 'particles' },
    };

    expect(buildLegacySurfaceInitArgs({ modules })).toEqual([
      modules.GS,
      modules.DATA,
      modules.AudioEngine,
      modules.ParticleSystem,
    ]);
  });

  it('falls back to canonical core scope modules when flat aliases are absent', () => {
    const core = {
      GS: { id: 'gs' },
      DATA: { id: 'data' },
      AudioEngine: { id: 'audio' },
      ParticleSystem: { id: 'particles' },
    };
    const modules = {
      featureScopes: {
        core,
      },
    };

    expect(buildLegacySurfaceInitArgs({ modules })).toEqual([
      core.GS,
      core.DATA,
      core.AudioEngine,
      core.ParticleSystem,
    ]);
  });
});
