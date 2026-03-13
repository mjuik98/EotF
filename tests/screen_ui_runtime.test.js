import { describe, expect, it, vi } from 'vitest';

vi.mock('../game/features/ui/presentation/browser/screen_ui_helpers.js', () => ({
  applyActiveScreenState: vi.fn(),
  shouldRemoveFloatingHpPanel: vi.fn(),
}));

describe('screen_ui_runtime', () => {
  it('updates current screen, removes the floating hp panel, and fires the title hook', async () => {
    const helpers = await import('../game/features/ui/presentation/browser/screen_ui_helpers.js');
    const { switchScreenRuntime } = await import('../game/ui/screens/screen_ui_runtime.js');
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
});
