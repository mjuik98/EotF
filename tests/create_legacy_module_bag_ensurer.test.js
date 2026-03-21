import { describe, expect, it, vi } from 'vitest';

import { createLegacyModuleBagEnsurer } from '../game/platform/legacy/game_module_registry.js';

describe('createLegacyModuleBagEnsurer', () => {
  it('returns resolved modules without importing or publishing', async () => {
    const loadModuleBag = vi.fn(async () => ({ SettingsUI: { id: 'loaded-settings' } }));
    const publishModuleBag = vi.fn((modules, moduleBag) => moduleBag);
    const ensureModules = createLegacyModuleBagEnsurer({
      resolveFromModules: (modules) => (modules?.SettingsUI ? { SettingsUI: modules.SettingsUI } : null),
      loadModuleBag,
      publishModuleBag,
    });

    const modules = {
      SettingsUI: { id: 'existing-settings' },
    };

    await expect(ensureModules(modules)).resolves.toEqual({
      SettingsUI: modules.SettingsUI,
    });
    expect(loadModuleBag).not.toHaveBeenCalled();
    expect(publishModuleBag).not.toHaveBeenCalled();
  });

  it('loads once, publishes once, and reuses the cached module bag', async () => {
    const loadModuleBag = vi.fn(async () => ({ RunModeUI: { id: 'loaded-run-mode' } }));
    const publishModuleBag = vi.fn((modules, moduleBag) => {
      modules.loaded = moduleBag;
      return moduleBag;
    });
    const ensureModules = createLegacyModuleBagEnsurer({
      loadModuleBag,
      publishModuleBag,
    });

    const modules = {};

    const firstResult = await ensureModules(modules);
    const secondResult = await ensureModules(modules);

    expect(firstResult).toEqual({ RunModeUI: { id: 'loaded-run-mode' } });
    expect(secondResult).toBe(firstResult);
    expect(loadModuleBag).toHaveBeenCalledTimes(1);
    expect(publishModuleBag).toHaveBeenCalledTimes(2);
    expect(modules.loaded).toBe(firstResult);
  });
});
