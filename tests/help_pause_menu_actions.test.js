import { describe, expect, it, vi } from 'vitest';

import { createTitlePauseMenuActions } from '../game/features/title/application/help_pause_menu_actions.js';

describe('help_pause_menu_actions', () => {
  it('builds pause menu callbacks around title help/pause actions', () => {
    const deps = {
      showDeckView: vi.fn(),
      openCodex: vi.fn(),
      openSettings: vi.fn(),
      quitGame: vi.fn(),
      setMasterVolume: vi.fn(),
      setSfxVolume: vi.fn(),
      setAmbientVolume: vi.fn(),
      returnToTitleFromPause: vi.fn(() => true),
    };
    const ui = {
      togglePause: vi.fn(),
      toggleHelp: vi.fn(),
      abandonRun: vi.fn(),
      confirmReturnToTitle: vi.fn(),
    };

    const callbacks = createTitlePauseMenuActions({ deps, ui });
    callbacks.onResume();
    callbacks.onOpenDeck();
    callbacks.onOpenCodex();
    callbacks.onOpenSettings();
    callbacks.onOpenHelp();
    callbacks.onAbandon();
    callbacks.onReturnToTitle();
    callbacks.onQuitGame();
    callbacks.onSetMasterVolume(10);
    callbacks.onSetSfxVolume(20);
    callbacks.onSetAmbientVolume(30);

    expect(ui.togglePause).toHaveBeenCalledTimes(5);
    expect(ui.toggleHelp).toHaveBeenCalledTimes(1);
    expect(deps.showDeckView).toHaveBeenCalledTimes(1);
    expect(deps.openCodex).toHaveBeenCalledTimes(1);
    expect(deps.openSettings).toHaveBeenCalledTimes(1);
    expect(ui.abandonRun).toHaveBeenCalledWith(deps);
    expect(ui.confirmReturnToTitle).toHaveBeenCalledWith(expect.objectContaining({
      returnToTitleFromPause: expect.any(Function),
    }));
    expect(deps.quitGame).toHaveBeenCalledTimes(1);
    expect(deps.setMasterVolume).toHaveBeenCalledWith(10);
    expect(deps.setSfxVolume).toHaveBeenCalledWith(20);
    expect(deps.setAmbientVolume).toHaveBeenCalledWith(30);
  });
});
