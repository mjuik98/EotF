import { afterEach, describe, expect, it, vi } from 'vitest';

describe('app_config', () => {
  afterEach(() => {
    delete globalThis.__GAME_CONFIG__;
    vi.resetModules();
  });

  it('reads host-level __GAME_CONFIG__ without relying on globalThis access in module code', async () => {
    globalThis.__GAME_CONFIG__ = {
      appName: 'custom-app',
      env: 'dev',
      eventHistoryMax: 250,
      metricsTopN: 25,
    };

    vi.resetModules();
    const { AppConfig, isDevMode } = await import('../game/core/app_config.js');

    expect(AppConfig.appName).toBe('custom-app');
    expect(AppConfig.env).toBe('development');
    expect(AppConfig.eventHistoryMax).toBe(250);
    expect(AppConfig.metricsTopN).toBe(25);
    expect(isDevMode()).toBe(true);
  });
});
