import { describe, expect, it, vi } from 'vitest';

vi.mock('../game/ui/screens/meta_progression_ui_runtime.js', () => ({
  selectMetaFragmentRuntime: vi.fn(),
  restartFromEndingRuntime: vi.fn(),
}));

describe('MetaProgressionUI facade', () => {
  it('delegates fragment selection and ending restart to the extracted runtime helper', async () => {
    const { MetaProgressionUI } = await import('../game/ui/screens/meta_progression_ui.js');
    const runtime = await import('../game/ui/screens/meta_progression_ui_runtime.js');
    const deps = { marker: true };

    MetaProgressionUI.selectEndingFragment('echo_boost', deps);
    MetaProgressionUI.selectFragment('echo_boost', deps);
    MetaProgressionUI.restartEndingFlow(deps);
    MetaProgressionUI.restartFromEnding(deps);

    expect(runtime.selectMetaFragmentRuntime).toHaveBeenCalledTimes(2);
    expect(runtime.selectMetaFragmentRuntime).toHaveBeenCalledWith('echo_boost', deps);
    expect(runtime.restartFromEndingRuntime).toHaveBeenCalledTimes(2);
    expect(runtime.restartFromEndingRuntime).toHaveBeenCalledWith(deps);
  });
});
