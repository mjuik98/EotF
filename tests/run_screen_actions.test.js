import { describe, expect, it, vi } from 'vitest';

import { showGameplayScreenService, showScreenService } from '../game/app/system/screen_service.js';

describe('screen_service helpers', () => {
  it('uses ScreenUI through screen_service when state dispatch is available', () => {
    const switchScreen = vi.fn();
    const screenUI = { switchScreen: vi.fn() };
    const gs = {
      currentScreen: 'title',
      dispatch: vi.fn(),
    };

    showScreenService('game', {
      gs,
      screenUI,
      switchScreen,
    });

    expect(gs.dispatch).toHaveBeenCalledTimes(1);
    expect(screenUI.switchScreen).toHaveBeenCalledWith('game', { gs });
    expect(switchScreen).not.toHaveBeenCalled();
  });

  it('falls back to generic switchScreen when dispatch is unavailable', () => {
    const switchScreen = vi.fn();

    showGameplayScreenService({
      gs: {},
      switchScreen,
    });

    expect(switchScreen).toHaveBeenCalledWith('game');
  });
});
