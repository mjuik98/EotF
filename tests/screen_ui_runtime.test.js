import { describe, expect, it, vi } from 'vitest';

vi.mock('../game/ui/screens/screen_ui_helpers.js', () => ({
  applyActiveScreenState: vi.fn(),
  shouldRemoveFloatingHpPanel: vi.fn(),
}));

vi.mock('../game/ui/shared/player_hp_panel_ui.js', () => ({
  removeFloatingPlayerHpPanel: vi.fn(),
}));

describe('screen_ui_runtime', () => {
  it('updates current screen, removes the floating hp panel, and fires the title hook', async () => {
    const helpers = await import('../game/ui/screens/screen_ui_helpers.js');
    const hpPanel = await import('../game/ui/shared/player_hp_panel_ui.js');
    const { switchScreenRuntime } = await import('../game/ui/screens/screen_ui_runtime.js');
    const doc = { marker: true };
    const gs = { currentScreen: 'combat' };
    const onEnterTitle = vi.fn();

    helpers.shouldRemoveFloatingHpPanel.mockReturnValue(true);

    switchScreenRuntime('title', { doc, gs, onEnterTitle });

    expect(helpers.applyActiveScreenState).toHaveBeenCalledWith('title', doc);
    expect(hpPanel.removeFloatingPlayerHpPanel).toHaveBeenCalledWith({ doc });
    expect(gs.currentScreen).toBe('title');
    expect(onEnterTitle).toHaveBeenCalledTimes(1);
  });
});
