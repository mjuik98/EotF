import { describe, expect, it } from 'vitest';

import { createLegacyGameApi } from '../game/platform/legacy/create_legacy_game_api.js';

describe('createLegacyGameApi', () => {
  it('merges grouped action bindings into a single compat surface', () => {
    const api = createLegacyGameApi({
      combatActions: { endPlayerTurn: () => 'combat' },
      queryBindings: { getMetrics: () => 'query' },
      runActions: { startGame: () => 'run' },
      settingsActions: { openSettings: () => 'settings' },
      uiActions: { showCharacterSelect: () => 'ui' },
    });

    expect(api.getMetrics()).toBe('query');
    expect(api.startGame()).toBe('run');
    expect(api.endPlayerTurn()).toBe('combat');
    expect(api.openSettings()).toBe('settings');
    expect(api.showCharacterSelect()).toBe('ui');
  });
});
