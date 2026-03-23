import { describe, expect, it } from 'vitest';

import {
  RUN_HOTKEY_MODE_POLICY,
  getRunHotkeyPolicy,
} from '../game/ui/screens/help_pause_ui_helpers.js';

describe('help pause hotkey policy table', () => {
  it('defines an explicit allowed-action table for each run input mode', () => {
    expect(RUN_HOTKEY_MODE_POLICY).toEqual({
      modal: {
        help: false,
        deckView: false,
        codex: false,
        pause: false,
        fullMap: false,
        combatHotkeys: false,
        runNavigationHotkeys: false,
      },
      cutscene: {
        help: false,
        deckView: false,
        codex: false,
        pause: false,
        fullMap: false,
        combatHotkeys: false,
        runNavigationHotkeys: false,
      },
      navigation: {
        help: true,
        deckView: true,
        codex: true,
        pause: true,
        fullMap: true,
        combatHotkeys: false,
        runNavigationHotkeys: true,
      },
      combat: {
        help: true,
        deckView: true,
        codex: true,
        pause: true,
        fullMap: false,
        combatHotkeys: true,
        runNavigationHotkeys: true,
      },
      title: {
        help: false,
        deckView: false,
        codex: false,
        pause: false,
        fullMap: false,
        combatHotkeys: false,
        runNavigationHotkeys: false,
      },
      exploration: {
        help: true,
        deckView: true,
        codex: true,
        pause: true,
        fullMap: true,
        combatHotkeys: false,
        runNavigationHotkeys: true,
      },
      gameplay: {
        help: false,
        deckView: false,
        codex: false,
        pause: false,
        fullMap: false,
        combatHotkeys: false,
        runNavigationHotkeys: false,
      },
    });
  });

  it('falls back to gameplay policy for unknown modes', () => {
    expect(getRunHotkeyPolicy('unknown-mode')).toEqual(RUN_HOTKEY_MODE_POLICY.gameplay);
  });
});
