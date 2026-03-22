import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { createGameBootPorts } from '../game/core/bootstrap/create_game_boot_ports.js';

describe('createGameBootPorts', () => {
  it('exposes narrow getters for boot payload composition', () => {
    const modules = {
      featureScopes: {
        core: {
          GAME: { getRunDeps: vi.fn(() => ({ token: 'run' })) },
          AudioEngine: { id: 'audio' },
          ParticleSystem: { id: 'particles' },
        },
        title: {
          HelpPauseUI: { id: 'help' },
          GameBootUI: { id: 'boot' },
          SettingsUI: { id: 'settings' },
        },
      },
    };

    const ports = createGameBootPorts(modules);

    expect(ports.getRunDeps()).toEqual({ token: 'run' });
    expect(ports.getAudioEngine()).toBe(modules.featureScopes.core.AudioEngine);
    expect(ports.getParticleSystem()).toBe(modules.featureScopes.core.ParticleSystem);
    expect(ports.getHelpPauseUI()).toBe(modules.featureScopes.title.HelpPauseUI);
    expect(ports.getGameBootUI()).toBe(modules.featureScopes.title.GameBootUI);
    expect(ports.getSettingsUI()).toBe(modules.featureScopes.title.SettingsUI);
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

  it('falls back to screen-scoped overlays when title scope does not own them', () => {
    const modules = {
      featureScopes: {
        core: {
          GAME: { getRunDeps: vi.fn(() => ({ token: 'run' })) },
          AudioEngine: { id: 'audio' },
          ParticleSystem: { id: 'particles' },
        },
        title: {
          GameBootUI: { id: 'boot' },
        },
        screen: {
          HelpPauseUI: { id: 'screen-help' },
          SettingsUI: { id: 'screen-settings' },
        },
      },
    };

    const ports = createGameBootPorts(modules);

    expect(ports.getHelpPauseUI()).toEqual({ id: 'screen-help' });
    expect(ports.getGameBootUI()).toEqual({ id: 'boot' });
    expect(ports.getSettingsUI()).toEqual({ id: 'screen-settings' });
  });

  it('keeps bootstrap ports routed through scoped registry accessors instead of flat module fallbacks', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/core/bootstrap/create_game_boot_ports.js'),
      'utf8',
    );

    expect(source).not.toContain('modules.GAME');
    expect(source).not.toContain('modules.AudioEngine');
    expect(source).not.toContain('modules.ParticleSystem');
    expect(source).not.toContain('modules.HelpPauseUI');
    expect(source).not.toContain('modules.GameBootUI');
    expect(source).not.toContain('modules.SettingsUI');
  });
});
