import { describe, expect, it, vi } from 'vitest';

import { buildBindingDepsRefs } from '../game/core/bootstrap/build_binding_deps_refs.js';

describe('buildBindingDepsRefs', () => {
  it('merges module refs and binding functions into one deps surface', () => {
    const modules = {
      CombatUI: { id: 'combat' },
      DeckModalUI: { id: 'deck-modal' },
    };
    const fns = {
      startGame: vi.fn(),
      openSettings: vi.fn(),
    };

    expect(buildBindingDepsRefs({ modules, fns })).toEqual({
      ...modules,
      ...fns,
    });
  });
});
