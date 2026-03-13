import { describe, expect, it, vi } from 'vitest';

import { createGameBootPorts } from '../game/core/bootstrap/create_game_boot_ports.js';

describe('createGameBootPorts', () => {
  it('exposes narrow getters for boot payload composition', () => {
    const modules = {
      GAME: { getRunDeps: vi.fn(() => ({ token: 'run' })) },
      AudioEngine: { id: 'audio' },
      ParticleSystem: { id: 'particles' },
      HelpPauseUI: { id: 'help' },
      GameBootUI: { id: 'boot' },
      SettingsUI: { id: 'settings' },
    };

    const ports = createGameBootPorts(modules);

    expect(ports.getRunDeps()).toEqual({ token: 'run' });
    expect(ports.getAudioEngine()).toBe(modules.AudioEngine);
    expect(ports.getParticleSystem()).toBe(modules.ParticleSystem);
    expect(ports.getHelpPauseUI()).toBe(modules.HelpPauseUI);
    expect(ports.getGameBootUI()).toBe(modules.GameBootUI);
    expect(ports.getSettingsUI()).toBe(modules.SettingsUI);
  });

  it('prefers feature-scoped registry modules for new bootstrap consumers', () => {
    const modules = {
      GAME: { getRunDeps: vi.fn(() => ({ token: 'flat-run' })) },
      AudioEngine: { id: 'flat-audio' },
      ParticleSystem: { id: 'flat-particles' },
      HelpPauseUI: { id: 'flat-help' },
      GameBootUI: { id: 'flat-boot' },
      SettingsUI: { id: 'flat-settings' },
      featureScopes: {
        core: {
          GAME: { getRunDeps: vi.fn(() => ({ token: 'scoped-run' })) },
          AudioEngine: { id: 'scoped-audio' },
          ParticleSystem: { id: 'scoped-particles' },
        },
        title: {
          HelpPauseUI: { id: 'scoped-help' },
          GameBootUI: { id: 'scoped-boot' },
          SettingsUI: { id: 'scoped-settings' },
        },
      },
    };

    const ports = createGameBootPorts(modules);

    expect(ports.getRunDeps()).toEqual({ token: 'scoped-run' });
    expect(ports.getAudioEngine()).toEqual({ id: 'scoped-audio' });
    expect(ports.getParticleSystem()).toEqual({ id: 'scoped-particles' });
    expect(ports.getHelpPauseUI()).toEqual({ id: 'scoped-help' });
    expect(ports.getGameBootUI()).toEqual({ id: 'scoped-boot' });
    expect(ports.getSettingsUI()).toEqual({ id: 'scoped-settings' });
  });
});
