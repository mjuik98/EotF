import { describe, expect, it, vi } from 'vitest';

vi.mock('../game/features/codex/presentation/browser/codex_ui_runtime.js', () => ({
  bindCodexGlobalKeys: vi.fn(),
  openCodexRuntime: vi.fn(),
  closeCodexRuntime: vi.fn(),
  setCodexTabRuntime: vi.fn(),
  renderCodexContentRuntime: vi.fn(),
}));

describe('CodexUI facade', () => {
  it('delegates modal and render actions to the runtime helper', async () => {
    const { CodexUI } = await import('../game/ui/screens/codex_ui.js');
    const runtime = await import('../game/features/codex/presentation/browser/codex_ui_runtime.js');
    const deps = { marker: true };

    CodexUI.openCodex(deps);
    CodexUI.closeCodex(deps);
    CodexUI.setCodexTab('items', deps);
    CodexUI.renderCodexContent(deps);

    expect(runtime.openCodexRuntime).toHaveBeenCalled();
    expect(runtime.closeCodexRuntime).toHaveBeenCalled();
    expect(runtime.setCodexTabRuntime).toHaveBeenCalledWith(expect.any(Object), CodexUI, 'items', deps);
    expect(runtime.renderCodexContentRuntime).toHaveBeenCalledWith(expect.any(Object), CodexUI, deps);
  });
});
