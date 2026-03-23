import { describe, expect, it, vi } from 'vitest';
import { Actions } from '../game/core/store/state_actions.js';

vi.mock('../game/features/ui/presentation/browser/screen_ui_helpers.js', () => ({
  applyActiveScreenState: vi.fn(),
  shouldRemoveFloatingHpPanel: vi.fn(),
}));

describe('screen_ui_runtime', () => {
  it('updates current screen, removes the floating hp panel, and fires the title hook', async () => {
    const helpers = await import('../game/features/ui/presentation/browser/screen_ui_helpers.js');
    const { switchScreenRuntime } = await import('../game/features/ui/presentation/browser/screen_ui_runtime.js');
    const floatingHpShell = { remove: vi.fn() };
    const doc = {
      marker: true,
      getElementById: vi.fn((id) => (id === 'ncFloatingHpShell' ? floatingHpShell : null)),
    };
    const gs = { currentScreen: 'combat' };
    const onEnterTitle = vi.fn();

    helpers.shouldRemoveFloatingHpPanel.mockReturnValue(true);

    switchScreenRuntime('title', { doc, gs, onEnterTitle });

    expect(helpers.applyActiveScreenState).toHaveBeenCalledWith('title', doc);
    expect(floatingHpShell.remove).toHaveBeenCalledTimes(1);
    expect(gs.currentScreen).toBe('title');
    expect(onEnterTitle).toHaveBeenCalledTimes(1);
  });

  it('prefers the screen state command when dispatch is available', async () => {
    const helpers = await import('../game/features/ui/presentation/browser/screen_ui_helpers.js');
    const { switchScreenRuntime } = await import('../game/features/ui/presentation/browser/screen_ui_runtime.js');
    const doc = {
      getElementById: vi.fn(() => null),
    };
    const gs = {
      currentScreen: 'combat',
      dispatch: vi.fn((action, payload) => {
        if (action === Actions.SCREEN_CHANGE) {
          gs.currentScreen = payload.screen;
          return { current: payload.screen, prev: 'combat' };
        }
        return null;
      }),
    };

    helpers.shouldRemoveFloatingHpPanel.mockReturnValue(false);

    switchScreenRuntime('reward', { doc, gs });

    expect(gs.dispatch).toHaveBeenCalledWith(Actions.SCREEN_CHANGE, { screen: 'reward' });
    expect(gs.currentScreen).toBe('reward');
  });
});
