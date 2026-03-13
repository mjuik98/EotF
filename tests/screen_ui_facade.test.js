import { describe, expect, it, vi } from 'vitest';

vi.mock('../game/features/ui/presentation/browser/screen_ui_helpers.js', () => ({
  getDoc: vi.fn(() => ({ id: 'doc' })),
}));

vi.mock('../game/features/ui/presentation/browser/screen_ui_runtime.js', () => ({
  switchScreenRuntime: vi.fn(),
}));

describe('ScreenUI facade', () => {
  it('delegates switchScreen to the extracted runtime helper with the resolved doc', async () => {
    const { ScreenUI } = await import('../game/ui/screens/screen_ui.js');
    const runtime = await import('../game/features/ui/presentation/browser/screen_ui_runtime.js');
    const deps = { marker: true };

    ScreenUI.switchScreen('title', deps);

    expect(runtime.switchScreenRuntime).toHaveBeenCalledWith('title', {
      ...deps,
      doc: { id: 'doc' },
    });
  });
});
