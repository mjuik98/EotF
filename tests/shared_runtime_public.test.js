import { describe, expect, it } from 'vitest';

import {
  buildLegacySharedModuleQueries,
  buildLegacyUtilityQueries,
} from '../game/shared/runtime/public.js';

describe('shared runtime public queries', () => {
  it('prefers feature-scoped shared module refs over stale top-level aliases', () => {
    const modules = {
      AudioEngine: { id: 'stale-audio' },
      SaveSystem: { id: 'stale-save' },
      SettingsUI: { id: 'stale-settings' },
      featureScopes: {
        core: {
          AudioEngine: { id: 'scoped-audio' },
          SaveSystem: { id: 'scoped-save' },
        },
        screen: {
          SettingsUI: { id: 'scoped-settings' },
        },
      },
    };

    const queries = buildLegacySharedModuleQueries(modules);

    expect(queries.AudioEngine).toEqual({ id: 'scoped-audio' });
    expect(queries.SaveSystem).toEqual({ id: 'scoped-save' });
    expect(queries.SettingsUI).toEqual({ id: 'scoped-settings' });
  });

  it('falls back to legacy compat refs before stale top-level aliases', () => {
    const modules = {
      DescriptionUtils: { id: 'stale-description' },
      CardCostUtils: { id: 'stale-card-cost' },
      legacyModules: {
        DescriptionUtils: { id: 'compat-description' },
        CardCostUtils: { id: 'compat-card-cost' },
      },
    };

    const queries = buildLegacyUtilityQueries(modules);

    expect(queries.DescriptionUtils).toEqual({ id: 'compat-description' });
    expect(queries.CardCostUtils).toEqual({ id: 'compat-card-cost' });
  });
});
