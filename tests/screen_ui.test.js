import { describe, expect, it, vi } from 'vitest';

import { ScreenUI } from '../game/ui/screens/screen_ui.js';

function makeScreenElement() {
  return {
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
    },
  };
}

describe('ScreenUI', () => {
  it('removes the floating hp panel when switching to a non-run screen', () => {
    const titleScreen = makeScreenElement();
    const gameScreen = makeScreenElement();
    const floatingHpShell = {
      remove: vi.fn(),
    };
    const doc = {
      querySelectorAll: vi.fn(() => [titleScreen, gameScreen]),
      getElementById: vi.fn((id) => ({
        titleScreen,
        gameScreen,
        ncFloatingHpShell: floatingHpShell,
      }[id] || null)),
    };
    const gs = { currentScreen: 'combat' };
    const onEnterTitle = vi.fn();

    ScreenUI.switchScreen('title', { doc, gs, onEnterTitle });

    expect(titleScreen.classList.add).toHaveBeenCalledWith('active');
    expect(titleScreen.classList.remove).toHaveBeenCalledWith('active');
    expect(gameScreen.classList.remove).toHaveBeenCalledWith('active');
    expect(floatingHpShell.remove).toHaveBeenCalledTimes(1);
    expect(gs.currentScreen).toBe('title');
    expect(onEnterTitle).toHaveBeenCalledTimes(1);
  });

  it('keeps the floating hp panel mounted while switching between run screens', () => {
    const combatScreen = makeScreenElement();
    const gameScreen = makeScreenElement();
    const floatingHpShell = {
      remove: vi.fn(),
    };
    const doc = {
      querySelectorAll: vi.fn(() => [combatScreen, gameScreen]),
      getElementById: vi.fn((id) => ({
        combatScreen,
        gameScreen,
        ncFloatingHpShell: floatingHpShell,
      }[id] || null)),
    };
    const gs = { currentScreen: 'title' };

    ScreenUI.switchScreen('game', { doc, gs });

    expect(gameScreen.classList.add).toHaveBeenCalledWith('active');
    expect(floatingHpShell.remove).not.toHaveBeenCalled();
    expect(gs.currentScreen).toBe('game');
  });

  it('does not fire the title hook for non-title screens', () => {
    const combatScreen = makeScreenElement();
    const gameScreen = makeScreenElement();
    const floatingHpShell = {
      remove: vi.fn(),
    };
    const doc = {
      querySelectorAll: vi.fn(() => [combatScreen, gameScreen]),
      getElementById: vi.fn((id) => ({
        combatScreen,
        gameScreen,
        ncFloatingHpShell: floatingHpShell,
      }[id] || null)),
    };
    const onEnterTitle = vi.fn();

    ScreenUI.switchScreen('combat', { doc, onEnterTitle });

    expect(combatScreen.classList.add).toHaveBeenCalledWith('active');
    expect(onEnterTitle).not.toHaveBeenCalled();
    expect(floatingHpShell.remove).not.toHaveBeenCalled();
  });
});
