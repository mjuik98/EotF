import { describe, expect, it, vi } from 'vitest';

vi.mock('../game/ui/screens/story_ui_runtime.js', () => ({
  unlockNextFragmentRuntime: vi.fn(),
  showRunFragmentRuntime: vi.fn(),
  checkHiddenEndingRuntime: vi.fn(),
  showEndingRuntime: vi.fn(),
}));

describe('StoryUI facade', () => {
  it('delegates fragment and ending methods to the extracted runtime helper', async () => {
    const { StoryUI } = await import('../game/ui/screens/story_ui.js');
    const runtime = await import('../game/ui/screens/story_ui_runtime.js');
    const deps = { marker: true };

    StoryUI.unlockNextFragment(deps);
    StoryUI.showRunFragment(deps);
    StoryUI.checkHiddenEnding(deps);
    StoryUI.showEnding(true, deps);

    expect(runtime.unlockNextFragmentRuntime).toHaveBeenCalledWith(deps);
    expect(runtime.showRunFragmentRuntime).toHaveBeenCalledWith(StoryUI, deps);
    expect(runtime.checkHiddenEndingRuntime).toHaveBeenCalledWith(deps);
    expect(runtime.showEndingRuntime).toHaveBeenCalledWith(true, deps);
  });
});
