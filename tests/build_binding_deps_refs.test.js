import { describe, expect, it, vi } from 'vitest';

import { buildBindingDepsRefs } from '../game/core/bootstrap/build_binding_deps_refs.js';

describe('buildBindingDepsRefs', () => {
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
});
