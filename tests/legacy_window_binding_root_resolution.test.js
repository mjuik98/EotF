import { describe, expect, it } from 'vitest';

import { resolveLegacyWindowBindingRoot } from '../game/platform/legacy/resolve_legacy_window_binding_root.js';

describe('resolveLegacyWindowBindingRoot', () => {
  it('prefers scoped canonical GAME deps over stale top-level GAME aliases', () => {
    const scopedWin = { id: 'scoped-win' };
    const modules = {
      GAME: {
        getUiDeps: () => ({ win: { id: 'stale-win' } }),
      },
      featureScopes: {
        core: {
          GAME: {
            getUiDeps: () => ({ win: scopedWin }),
          },
        },
      },
    };

    expect(resolveLegacyWindowBindingRoot(modules)).toBe(scopedWin);
  });
});
