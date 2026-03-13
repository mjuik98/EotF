import { describe, expect, it, vi } from 'vitest';

vi.mock('../game/ui/run/run_return_ui_runtime.js', () => ({
  returnToGameRuntime: vi.fn(),
}));
vi.mock('../game/features/run/presentation/browser/run_return_ui_runtime.js', () => ({
  returnToGameRuntime: vi.fn(),
}));

describe('RunReturnUI facade', () => {
  it('delegates returnToGame to the extracted runtime helper', async () => {
    const { RunReturnUI } = await import('../game/ui/run/run_return_ui.js');
    const runtime = await import('../game/features/run/presentation/browser/run_return_ui_runtime.js');
    const deps = { marker: true };

    RunReturnUI.returnToGame(true, deps);

    expect(runtime.returnToGameRuntime).toHaveBeenCalledWith(true, deps);
  });

  it('delegates returnFromReward to the runtime helper with reward context', async () => {
    const { RunReturnUI } = await import('../game/ui/run/run_return_ui.js');
    const runtime = await import('../game/features/run/presentation/browser/run_return_ui_runtime.js');
    const deps = { marker: 'reward' };

    RunReturnUI.returnFromReward(deps);

    expect(runtime.returnToGameRuntime).toHaveBeenCalledWith(true, deps);
  });
});
