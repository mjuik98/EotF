import { describe, expect, it, vi } from 'vitest';

vi.mock('../game/features/title/presentation/browser/game_canvas_setup_ui_runtime.js', () => ({
  getGameCanvasRefs: vi.fn(() => ({ gameCanvas: { id: 'gameCanvas' } })),
  initGameCanvasRuntime: vi.fn(() => ({ gameCanvas: { id: 'gameCanvas' } })),
  resizeGameCanvasRuntime: vi.fn(),
}));

describe('GameCanvasSetupUI facade', () => {
  it('delegates ref access, init, and resize to the extracted runtime helper', async () => {
    const { GameCanvasSetupUI } = await import('../game/ui/title/game_canvas_setup_ui.js');
    const runtime = await import('../game/features/title/presentation/browser/game_canvas_setup_ui_runtime.js');
    const deps = { marker: true };

    const refs = GameCanvasSetupUI.getRefs();
    const initResult = GameCanvasSetupUI.init(deps);
    GameCanvasSetupUI.resize(deps);

    expect(refs).toEqual({ gameCanvas: { id: 'gameCanvas' } });
    expect(initResult).toEqual({ gameCanvas: { id: 'gameCanvas' } });
    expect(runtime.getGameCanvasRefs).toHaveBeenCalledTimes(1);
    expect(runtime.initGameCanvasRuntime).toHaveBeenCalledWith(expect.any(Object), GameCanvasSetupUI, deps);
    expect(runtime.resizeGameCanvasRuntime).toHaveBeenCalledWith(expect.any(Object), deps);
  });
});
