import { describe, expect, it, vi } from 'vitest';

import { buildGameBootRefs } from '../game/core/bootstrap/build_game_boot_refs.js';

describe('buildGameBootRefs', () => {
  it('collects boot refs from narrowed boot ports and deps getters', () => {
    const modules = {
      GAME: { getRunDeps: vi.fn(() => ({ token: 'run-deps' })) },
      AudioEngine: { id: 'audio' },
      ParticleSystem: { id: 'particles' },
      HelpPauseUI: { id: 'help-pause' },
      GameBootUI: { id: 'game-boot' },
      SettingsUI: { id: 'settings' },
    };
    modules.featureScopes = {
      core: {
        GAME: modules.GAME,
        AudioEngine: modules.AudioEngine,
        ParticleSystem: modules.ParticleSystem,
      },
      title: {
        HelpPauseUI: modules.HelpPauseUI,
        GameBootUI: modules.GameBootUI,
        SettingsUI: modules.SettingsUI,
      },
    };
    const deps = {
      getGameBootDeps: vi.fn(() => ({ token: 'game-boot-deps' })),
      getHelpPauseDeps: vi.fn(() => ({ token: 'help-pause-deps' })),
    };

    const refs = buildGameBootRefs({ modules, deps });

    expect(refs.token).toBe('run-deps');
    expect(refs.audioEngine).toBe(modules.AudioEngine);
    expect(refs.particleSystem).toBe(modules.ParticleSystem);
    expect(refs.helpPauseUI).toBe(modules.HelpPauseUI);
    expect(refs.gameBootUI).toBe(modules.GameBootUI);
    expect(refs.settingsUI).toBe(modules.SettingsUI);
    expect(refs.getGameBootDeps()).toEqual({ token: 'game-boot-deps' });
    expect(refs.getHelpPauseDeps()).toEqual({ token: 'help-pause-deps' });
  });
});
