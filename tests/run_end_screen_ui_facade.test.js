import { describe, expect, it, vi } from 'vitest';

vi.mock('../game/features/title/presentation/browser/run_end_screen_runtime.js', () => ({
  initRunEndScreenRuntime: vi.fn(),
  showRunEndScreenRuntime: vi.fn(),
  closeRunEndScreenRuntime: vi.fn(),
  destroyRunEndScreenRuntime: vi.fn(),
}));

describe('RunEndScreenUI facade', () => {
  it('delegates constructor setup and instance methods to the extracted runtime helper', async () => {
    const runtime = await import('../game/features/title/presentation/browser/run_end_screen_runtime.js');
    const { RunEndScreenUI } = await import('../game/ui/title/run_end_screen_ui.js');
    const summary = { outcome: 'victory' };
    const classInfo = { title: 'Mage' };
    const raf = vi.fn();
    const setTimeout = vi.fn();
    const ui = new RunEndScreenUI({
      doc: { createElement: vi.fn(), body: { appendChild: vi.fn() }, addEventListener: vi.fn() },
      raf,
      setTimeout,
    });

    ui.show(summary, classInfo);
    ui.close();
    ui.destroy();

    expect(runtime.initRunEndScreenRuntime).toHaveBeenCalledWith(ui);
    expect(ui._raf).toBe(raf);
    expect(ui._setTimeout).toBe(setTimeout);
    expect(runtime.showRunEndScreenRuntime).toHaveBeenCalledWith(ui, summary, classInfo);
    expect(runtime.closeRunEndScreenRuntime).toHaveBeenCalledWith(ui);
    expect(runtime.destroyRunEndScreenRuntime).toHaveBeenCalledWith(ui);
  });
});
