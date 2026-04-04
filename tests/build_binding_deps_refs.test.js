import { describe, expect, it, vi } from 'vitest';

import { buildBindingDepsRefs } from '../game/core/bootstrap/build_binding_deps_refs.js';

describe('buildBindingDepsRefs', () => {
  it('keeps feature ref grouping owned by the core/composition catalog', async () => {
    const { buildBindingFeatureRefs } = await import(
      '../game/core/bootstrap/build_binding_feature_refs.js'
    );
    const { buildFeatureBindingRefGroups } = await import(
      '../game/core/composition/feature_binding_ref_catalog.js'
    );
    const refs = {
      GAME: { id: 'game' },
      GS: { id: 'gs' },
      ScreenUI: { id: 'screen' },
      CombatUI: { id: 'combat' },
      RewardUI: { id: 'reward' },
    };

    expect(buildBindingFeatureRefs(refs)).toEqual({
      core: {
        GAME: { id: 'game' },
        GS: { id: 'gs' },
      },
      ...buildFeatureBindingRefGroups(refs),
    });
  });

  it('prefers scoped module refs and merges binding functions into one deps surface', () => {
    const modules = {
      CombatUI: { id: 'stale-top-level-combat' },
      featureScopes: {
        core: { GAME: { id: 'game' }, AudioEngine: { id: 'audio' } },
        combat: { CombatUI: { id: 'combat' }, DeckModalUI: { id: 'deck-modal' } },
        screen: { ScreenUI: { id: 'screen' } },
      },
    };
    const fns = {
      startGame: vi.fn(),
      openSettings: vi.fn(),
    };

    expect(buildBindingDepsRefs({ modules, fns })).toEqual({
      GAME: { id: 'game' },
      AudioEngine: { id: 'audio' },
      CombatUI: { id: 'combat' },
      DeckModalUI: { id: 'deck-modal' },
      ScreenUI: { id: 'screen' },
      ...fns,
    });
  });

  it('falls back to top-level module refs when feature scopes are absent', () => {
    const modules = {
      CombatUI: { id: 'combat' },
      DeckModalUI: { id: 'deck-modal' },
    };
    const fns = { startGame: vi.fn() };

    expect(buildBindingDepsRefs({ modules, fns })).toEqual({
      ...modules,
      ...fns,
    });
  });

  it('prefers legacy compat refs over stale top-level aliases for unscoped modules', () => {
    const modules = {
      SettingsUI: { id: 'stale-settings' },
      featureScopes: {
        core: { GAME: { id: 'game' } },
      },
      legacyModules: {
        SettingsUI: { id: 'compat-settings' },
      },
    };
    const fns = { openSettings: vi.fn() };

    expect(buildBindingDepsRefs({ modules, fns })).toEqual({
      GAME: { id: 'game' },
      SettingsUI: { id: 'compat-settings' },
      ...fns,
    });
  });
});
