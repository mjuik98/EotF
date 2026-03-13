import { describe, expect, it, vi } from 'vitest';

vi.mock('../game/features/title/presentation/browser/level_up_popup_runtime.js', () => ({
  initLevelUpPopupRuntime: vi.fn(),
  showLevelUpPopupRuntime: vi.fn(),
  closeLevelUpPopupRuntime: vi.fn(),
  destroyLevelUpPopupRuntime: vi.fn(),
}));

describe('LevelUpPopupUI facade', () => {
  it('delegates constructor setup and instance methods to the extracted runtime helper', async () => {
    const runtime = await import('../game/features/title/presentation/browser/level_up_popup_runtime.js');
    const { LevelUpPopupUI } = await import('../game/ui/title/level_up_popup_ui.js');
    const payload = { newLevel: 2 };
    const raf = vi.fn();
    const cancelRaf = vi.fn();
    const ui = new LevelUpPopupUI({
      doc: { createElement: vi.fn(), body: { appendChild: vi.fn() }, addEventListener: vi.fn(), removeEventListener: vi.fn() },
      win: { addEventListener: vi.fn(), removeEventListener: vi.fn() },
      raf,
      cancelRaf,
    });

    ui.show(payload);
    ui.close();
    ui.destroy();

    expect(runtime.initLevelUpPopupRuntime).toHaveBeenCalledWith(ui);
    expect(ui._rafImpl).toBe(raf);
    expect(ui._cancelRafImpl).toBe(cancelRaf);
    expect(runtime.showLevelUpPopupRuntime).toHaveBeenCalledWith(ui, payload);
    expect(runtime.closeLevelUpPopupRuntime).toHaveBeenCalledWith(ui);
    expect(runtime.destroyLevelUpPopupRuntime).toHaveBeenCalledWith(ui);
  });
});
