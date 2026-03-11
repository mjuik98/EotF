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
});
