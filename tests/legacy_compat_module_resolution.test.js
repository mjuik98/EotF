import { describe, expect, it } from 'vitest';

import {
  resolveLegacyCompatModules,
  resolveLegacyCompatValue,
  resolveLegacyGameRoot,
} from '../game/platform/legacy/resolve_legacy_module_bag.js';

describe('legacy compat module resolution', () => {
  it('builds a compat module view that prefers scoped feature modules', () => {
    const scopedGame = { id: 'scoped-game' };
    const scopedRunModeUI = { id: 'scoped-run-mode-ui' };
    const modules = {
      GAME: { id: 'top-level-game' },
      legacyModules: {
        GAME: { id: 'legacy-game' },
        RunModeUI: { id: 'legacy-run-mode-ui' },
      },
      featureScopes: {
        core: { GAME: scopedGame },
        run: { RunModeUI: scopedRunModeUI },
      },
    };

    const compatModules = resolveLegacyCompatModules(modules);

    expect(compatModules.GAME).toBe(scopedGame);
    expect(compatModules.RunModeUI).toBe(scopedRunModeUI);
    expect(modules.legacyModules.RunModeUI).toEqual({ id: 'legacy-run-mode-ui' });
    expect(resolveLegacyGameRoot(modules)).toBe(scopedGame);
  });

  it('does not recurse through top-level accessor aliases when resolving legacy compat values', () => {
    const modules = {
      featureScopes: {
        core: {},
      },
      legacyModules: {},
    };

    Object.defineProperty(modules, 'SettingsUI', {
      configurable: true,
      enumerable: false,
      get() {
        throw new Error('should not read top-level accessor');
      },
    });

    expect(resolveLegacyCompatValue(modules, 'SettingsUI')).toBeUndefined();
  });
});
