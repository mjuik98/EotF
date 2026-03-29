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

  it('re-resolves live deps when returning to title from the pause menu', () => {
    const staleReturnToTitle = vi.fn(() => false);
    const freshReturnToTitle = vi.fn(() => true);
    const ui = {
      togglePause: vi.fn(),
      toggleHelp: vi.fn(),
      abandonRun: vi.fn(),
      confirmReturnToTitle: vi.fn(),
    };

    const callbacks = createTitlePauseMenuActions({
      deps: {
        returnToTitleFromPause: staleReturnToTitle,
        getDeps: () => ({
          returnToTitleFromPause: freshReturnToTitle,
          marker: 'fresh',
        }),
      },
      ui,
    });

    callbacks.onReturnToTitle();

    expect(ui.confirmReturnToTitle).toHaveBeenCalledWith(expect.objectContaining({
      marker: 'fresh',
      returnToTitleFromPause: expect.any(Function),
    }));

    const [{ returnToTitleFromPause }] = ui.confirmReturnToTitle.mock.calls[0];
    expect(returnToTitleFromPause()).toBe(true);
    expect(freshReturnToTitle).toHaveBeenCalledTimes(1);
    expect(staleReturnToTitle).not.toHaveBeenCalled();
  });

  it('waits for the codex to open before closing the pause menu', async () => {
    let releaseOpenCodex = null;
    const openCodex = vi.fn(() => new Promise((resolve) => {
      releaseOpenCodex = resolve;
    }));
    const ui = {
      togglePause: vi.fn(),
      toggleHelp: vi.fn(),
      abandonRun: vi.fn(),
      confirmReturnToTitle: vi.fn(),
    };

    const callbacks = createTitlePauseMenuActions({
      deps: { openCodex },
      ui,
    });

    const openPromise = callbacks.onOpenCodex();
    expect(openCodex).toHaveBeenCalledTimes(1);
    expect(ui.togglePause).not.toHaveBeenCalled();

    releaseOpenCodex?.();
    await openPromise;

    expect(ui.togglePause).toHaveBeenCalledTimes(1);
  });

  it('waits for settings to open before closing the pause menu', async () => {
    let releaseOpenSettings = null;
    const openSettings = vi.fn(() => new Promise((resolve) => {
      releaseOpenSettings = resolve;
    }));
    const ui = {
      togglePause: vi.fn(),
      toggleHelp: vi.fn(),
      abandonRun: vi.fn(),
      confirmReturnToTitle: vi.fn(),
    };

    const callbacks = createTitlePauseMenuActions({
      deps: { openSettings },
      ui,
    });

    const openPromise = callbacks.onOpenSettings();
    expect(openSettings).toHaveBeenCalledTimes(1);
    expect(ui.togglePause).not.toHaveBeenCalled();

    releaseOpenSettings?.();
    await openPromise;

    expect(ui.togglePause).toHaveBeenCalledTimes(1);
  });

  it('keeps the pause menu open and logs the error when a surface action fails', async () => {
    const error = new Error('settings failed');
    const logger = {
      child: vi.fn(() => ({
        debug: vi.fn(),
        error: vi.fn(),
      })),
    };
    const ui = {
      togglePause: vi.fn(),
      toggleHelp: vi.fn(),
      abandonRun: vi.fn(),
      confirmReturnToTitle: vi.fn(),
    };

    const callbacks = createTitlePauseMenuActions({
      deps: {
        logger,
        openSettings: vi.fn(() => Promise.reject(error)),
      },
      ui,
    });

    await expect(callbacks.onOpenSettings()).rejects.toThrow('settings failed');

    const pauseLogger = logger.child.mock.results[0].value;
    expect(ui.togglePause).not.toHaveBeenCalled();
    expect(pauseLogger.error).toHaveBeenCalledTimes(1);
  });
});
