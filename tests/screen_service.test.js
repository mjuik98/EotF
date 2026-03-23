import { describe, expect, it, vi } from 'vitest';
import { setScreenService } from '../game/features/ui/ports/public_application_capabilities.js';

describe('screen_service', () => {
  it('dispatches screen changes and prefers ScreenUI when available', () => {
    const gs = {
      currentScreen: 'title',
      dispatch: vi.fn(),
    };
    const logger = { info: vi.fn() };
    const screenUI = { switchScreen: vi.fn() };
    const switchScreen = vi.fn();

    setScreenService({
      screenName: 'game',
      gs,
      logger,
      screenUI,
      switchScreen,
    });

    expect(logger.info).toHaveBeenCalled();
    expect(gs.dispatch).toHaveBeenCalled();
    expect(screenUI.switchScreen).toHaveBeenCalledWith('game', { gs });
    expect(switchScreen).not.toHaveBeenCalled();
  });

  it('falls back to generic switchScreen when ScreenUI is unavailable', () => {
    const gs = {
      currentScreen: 'title',
      dispatch: vi.fn(),
    };
    const switchScreen = vi.fn();

    setScreenService({
      screenName: 'settings',
      gs,
      logger: null,
      screenUI: null,
      switchScreen,
    });

    expect(switchScreen).toHaveBeenCalledWith('settings');
  });
});
