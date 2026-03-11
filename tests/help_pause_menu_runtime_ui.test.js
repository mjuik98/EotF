import { describe, expect, it, vi } from 'vitest';
import {
  closePauseMenuRuntime,
  createPauseMenuRuntimeCallbacks,
  saveRunBeforeReturnRuntime,
  swallowEscapeEvent,
} from '../game/ui/screens/help_pause_menu_runtime_ui.js';

describe('help_pause_menu_runtime_ui', () => {
  it('prefers SaveSystem for return-to-title save fallback and falls back to deps.saveRun', () => {
    const saveRun = vi.fn();
    globalThis.SaveSystem = { saveRun };

    expect(saveRunBeforeReturnRuntime({ gs: { currentScreen: 'game' }, saveRun: vi.fn() })).toBe(true);
    expect(saveRun).toHaveBeenCalledWith({
      gs: { currentScreen: 'game' },
      isGameStarted: expect.any(Function),
    });

    delete globalThis.SaveSystem;
    const depsSaveRun = vi.fn();
    expect(saveRunBeforeReturnRuntime({ gs: { currentScreen: 'game' }, saveRun: depsSaveRun })).toBe(true);
    expect(depsSaveRun).toHaveBeenCalledTimes(1);
  });

  it('closes the pause menu and swallows escape events', () => {
    const remove = vi.fn();
    const onClose = vi.fn();
    const doc = {
      getElementById: vi.fn((id) => (id === 'pauseMenu' ? { remove } : null)),
    };
    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      stopImmediatePropagation: vi.fn(),
    };

    closePauseMenuRuntime(doc, onClose);
    swallowEscapeEvent(event);

    expect(remove).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    expect(event.stopImmediatePropagation).toHaveBeenCalledTimes(1);
  });

  it('creates pause menu callbacks that route through the UI and deps surface', () => {
    const deps = {
      showDeckView: vi.fn(),
      openCodex: vi.fn(),
      openSettings: vi.fn(),
      quitGame: vi.fn(),
      setMasterVolume: vi.fn(),
      setSfxVolume: vi.fn(),
      setAmbientVolume: vi.fn(),
    };
    const ui = {
      togglePause: vi.fn(),
      toggleHelp: vi.fn(),
      abandonRun: vi.fn(),
      confirmReturnToTitle: vi.fn(),
    };

    const callbacks = createPauseMenuRuntimeCallbacks({ deps, ui });
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
    expect(ui.confirmReturnToTitle).toHaveBeenCalledWith(deps);
    expect(deps.quitGame).toHaveBeenCalledTimes(1);
    expect(deps.setMasterVolume).toHaveBeenCalledWith(10);
    expect(deps.setSfxVolume).toHaveBeenCalledWith(20);
    expect(deps.setAmbientVolume).toHaveBeenCalledWith(30);
  });
});
