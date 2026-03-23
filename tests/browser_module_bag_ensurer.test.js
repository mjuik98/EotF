import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { createBrowserModuleBagEnsurer } from '../game/platform/browser/module_bag_ensurer.js';

describe('browser module bag ensurer', () => {
  it('reuses resolved modules without loading and publishes loaded modules through the provided publisher', async () => {
    const loadModuleBag = vi.fn(async () => ({ RunModeUI: { id: 'loaded-run-mode' } }));
    const publishModuleBag = vi.fn((modules, moduleBag) => {
      modules.loaded = moduleBag;
      return moduleBag;
    });
    const ensureModules = createBrowserModuleBagEnsurer({
      resolveFromModules: (modules) => (modules?.RunModeUI ? { RunModeUI: modules.RunModeUI } : null),
      loadModuleBag,
      publishModuleBag,
    });

    await expect(ensureModules({ RunModeUI: { id: 'existing' } })).resolves.toEqual({
      RunModeUI: { id: 'existing' },
    });

    const modules = {};
    const first = await ensureModules(modules);
    const second = await ensureModules(modules);

    expect(first).toEqual({ RunModeUI: { id: 'loaded-run-mode' } });
    expect(second).toBe(first);
    expect(loadModuleBag).toHaveBeenCalledTimes(1);
    expect(publishModuleBag).toHaveBeenCalledTimes(2);
    expect(modules.loaded).toBe(first);
  });

  it('moves feature browser module ensurers onto the platform/browser helper', () => {
    const files = [
      'game/features/ui/platform/browser/ensure_settings_browser_modules.js',
      'game/features/codex/platform/browser/ensure_codex_browser_modules.js',
      'game/features/run/platform/browser/ensure_run_flow_browser_modules.js',
    ];

    for (const file of files) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).toContain('function createFeatureModuleBagEnsurer');
      expect(source).not.toContain("platform/legacy/game_module_registry.js");
    }
  });
});
