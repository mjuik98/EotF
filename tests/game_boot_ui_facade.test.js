import { describe, expect, it, vi } from 'vitest';

vi.mock('../game/features/title/presentation/browser/game_boot_ui_runtime.js', () => ({
  bootGameRuntime: vi.fn(),
  bootWhenReadyRuntime: vi.fn(),
}));

describe('GameBootUI facade', () => {
  it('delegates boot entry points to the extracted runtime helper', async () => {
    const { GameBootUI } = await import('../game/ui/title/game_boot_ui.js');
    const runtime = await import('../game/features/title/presentation/browser/game_boot_ui_runtime.js');
    const deps = { marker: true };

    GameBootUI.bootGame(deps);
    GameBootUI.bootWhenReady(deps);

    expect(runtime.bootGameRuntime).toHaveBeenCalledWith(GameBootUI, deps);
    expect(runtime.bootWhenReadyRuntime).toHaveBeenCalledWith(GameBootUI, deps);
  });
});
