import { describe, expect, it } from 'vitest';

import {
  resolveCoreRuntimeModule,
  resolveScopedRuntimeModule,
} from '../game/shared/runtime/resolve_scoped_runtime_module.js';

describe('resolve_scoped_runtime_module', () => {
  it('prefers feature scope, then legacy compat, then top-level modules', () => {
    const modules = {
      GS: { token: 'top-level' },
      legacyModules: {
        GS: { token: 'legacy' },
      },
      featureScopes: {
        core: {
          GS: { token: 'scoped' },
        },
      },
    };

    expect(resolveScopedRuntimeModule(modules, 'GS', ['core'])).toEqual({ token: 'scoped' });
    expect(resolveCoreRuntimeModule(modules, 'GS')).toEqual({ token: 'scoped' });
  });

  it('falls back through compat layers when the preferred scope is missing', () => {
    const modules = {
      SettingsUI: { token: 'top-level' },
      legacyModules: {
        SettingsUI: { token: 'legacy' },
      },
      featureScopes: {
        core: {},
      },
    };

    expect(resolveScopedRuntimeModule(modules, 'SettingsUI', ['screen'])).toEqual({ token: 'legacy' });
  });
});
