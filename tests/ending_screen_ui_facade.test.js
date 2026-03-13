import { describe, expect, it, vi } from 'vitest';

vi.mock('../game/ui/screens/ending_screen_ui_runtime.js', () => ({
  cleanupEndingSession: vi.fn(),
  showOutcomeScreenRuntime: vi.fn(() => ({ timers: [], cleanups: [] })),
}));
vi.mock('../game/features/ui/presentation/browser/ending_screen_ui_runtime.js', () => ({
  cleanupEndingSession: vi.fn(),
  showOutcomeScreenRuntime: vi.fn(() => ({ timers: [], cleanups: [] })),
}));

describe('EndingScreenUI facade', () => {
  it('delegates outcome display and cleanup to runtime helpers', async () => {
    const { EndingScreenUI } = await import('../game/ui/screens/ending_screen_ui.js');
    const runtime = await import('../game/features/ui/presentation/browser/ending_screen_ui_runtime.js');
    const deps = { marker: true };

    expect(EndingScreenUI.show(false, deps)).toBe(true);
    expect(runtime.showOutcomeScreenRuntime).toHaveBeenCalledWith('victory', deps, {
      cleanup: EndingScreenUI.cleanup,
    });

    EndingScreenUI.cleanup(deps);
    expect(runtime.cleanupEndingSession).toHaveBeenCalled();
  });
});
