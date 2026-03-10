import { describe, expect, it, vi } from 'vitest';

vi.mock('../game/ui/run/run_setup_ui_runtime.js', () => ({
  startGameRuntime: vi.fn(),
}));

describe('RunSetupUI facade', () => {
  it('delegates startGame to the extracted runtime helper', async () => {
    const { RunSetupUI } = await import('../game/ui/run/run_setup_ui.js');
    const runtime = await import('../game/ui/run/run_setup_ui_runtime.js');
    const deps = { marker: true };

    RunSetupUI.startGame(deps);

    expect(runtime.startGameRuntime).toHaveBeenCalledWith(deps);
  });
});
