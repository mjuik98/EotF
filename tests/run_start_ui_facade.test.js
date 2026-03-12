import { describe, expect, it, vi } from 'vitest';

vi.mock('../game/features/run/application/create_run_start_runtime.js', () => ({
  enterRunRuntime: vi.fn(),
}));

describe('RunStartUI facade', () => {
  it('delegates enterRun to the extracted runtime helper', async () => {
    const { RunStartUI } = await import('../game/ui/run/run_start_ui.js');
    const runtime = await import('../game/features/run/application/create_run_start_runtime.js');
    const deps = { marker: true };

    RunStartUI.enterRun(deps);

    expect(runtime.enterRunRuntime).toHaveBeenCalledWith(deps);
  });
});
