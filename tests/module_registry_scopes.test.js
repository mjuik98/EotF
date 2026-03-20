import { describe, expect, it } from 'vitest';

import {
  getModuleRegistryScope,
  resolveModuleRegistryGameRoot,
  resolveModuleRegistryValue,
} from '../game/core/bindings/module_registry_scopes.js';
import { resolveModuleRegistryCompatValue } from '../game/core/bindings/resolve_module_registry_legacy_compat.js';

describe('module_registry_scopes', () => {
  it('returns empty scope objects when a scope is missing', () => {
    expect(getModuleRegistryScope({}, 'core')).toEqual({});
  });

  it('resolves scope-first module values before legacy and top-level fallbacks', () => {
    const scopedValue = { id: 'scoped-run-ui' };
    const modules = {
      RunModeUI: { id: 'top-level-run-ui' },
      legacyModules: {
        RunModeUI: { id: 'legacy-run-ui' },
      },
      featureScopes: {
        run: {
          RunModeUI: scopedValue,
        },
      },
    };

    expect(resolveModuleRegistryValue(modules, 'RunModeUI', ['run'])).toBe(scopedValue);
  });

  it('falls back to legacy and top-level values when scopes omit the key', () => {
    const topLevelGame = { id: 'top-level-game' };
    const legacyGame = { id: 'legacy-game' };

    expect(resolveModuleRegistryValue({
      GAME: topLevelGame,
    }, 'GAME', ['core'])).toBe(topLevelGame);

    expect(resolveModuleRegistryValue({
      GAME: topLevelGame,
      legacyModules: { GAME: legacyGame },
    }, 'GAME', ['core'])).toBe(legacyGame);
  });

  it('resolves the canonical game root through the core scope first', () => {
    const scopedGame = { id: 'scoped-game' };
    const modules = {
      GAME: { id: 'top-level-game' },
      legacyModules: { GAME: { id: 'legacy-game' } },
      featureScopes: {
        core: {
          GAME: scopedGame,
        },
      },
    };

    expect(resolveModuleRegistryGameRoot(modules)).toBe(scopedGame);
  });

  it('does not recurse through top-level accessor aliases when resolving compat values', () => {
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

    expect(resolveModuleRegistryCompatValue(modules, 'SettingsUI')).toBeUndefined();
  });
});
