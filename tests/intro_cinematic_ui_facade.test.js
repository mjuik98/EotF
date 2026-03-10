import { describe, expect, it, vi } from 'vitest';

vi.mock('../game/ui/title/intro_cinematic_runtime.js', () => ({
  playIntroCinematicRuntime: vi.fn(),
}));

describe('IntroCinematicUI facade', () => {
  it('delegates play to the extracted runtime helper', async () => {
    const { IntroCinematicUI } = await import('../game/ui/title/intro_cinematic_ui.js');
    const runtime = await import('../game/ui/title/intro_cinematic_runtime.js');
    const deps = { marker: true };
    const onComplete = vi.fn();

    IntroCinematicUI.play(deps, onComplete);

    expect(runtime.playIntroCinematicRuntime).toHaveBeenCalledWith(deps, onComplete);
  });
});
