import { afterEach, describe, expect, it, vi } from 'vitest';
import { StoryUI } from '../game/ui/screens/story_ui.js';

function createDeps({ storyPieces = [], fragments = [], runCount = 1 } = {}) {
  return {
    gs: {
      meta: {
        runCount,
        storyPieces: [...storyPieces],
        inscriptions: {},
        _hiddenEndingHinted: false,
      },
    },
    data: {
      storyFragments: [...fragments],
      inscriptions: {},
    },
  };
}

describe('StoryUI stage fragment flow', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the next unseen fragment instead of repeating the current run fragment', () => {
    const deps = createDeps({
      storyPieces: [1],
      runCount: 1,
      fragments: [
        { id: 1, run: 1, title: 'A', text: 'A' },
        { id: 2, run: 2, title: 'B', text: 'B' },
      ],
    });
    const displaySpy = vi.spyOn(StoryUI, 'displayFragment').mockReturnValue(true);

    const shown = StoryUI.showRunFragment(deps);

    expect(shown).toBe(true);
    expect(displaySpy).toHaveBeenCalledWith(
      { id: 2, run: 2, title: 'B', text: 'B' },
      deps,
    );
    expect(deps.gs.meta.storyPieces).toEqual([1, 2]);
  });

  it('progresses sequentially across repeated stage entries', () => {
    const deps = createDeps({
      fragments: [
        { id: 1, run: 1, title: 'A', text: 'A' },
        { id: 2, run: 2, title: 'B', text: 'B' },
        { id: 3, run: 3, title: 'C', text: 'C' },
      ],
    });
    const displaySpy = vi.spyOn(StoryUI, 'displayFragment').mockReturnValue(true);

    StoryUI.showRunFragment(deps);
    StoryUI.showRunFragment(deps);

    expect(displaySpy).toHaveBeenCalledTimes(2);
    expect(displaySpy.mock.calls[0][0].id).toBe(1);
    expect(displaySpy.mock.calls[1][0].id).toBe(2);
    expect(deps.gs.meta.storyPieces).toEqual([1, 2]);
  });

  it('returns false when there is no unseen fragment left', () => {
    const deps = createDeps({
      storyPieces: [1, 2],
      fragments: [
        { id: 1, run: 1, title: 'A', text: 'A' },
        { id: 2, run: 2, title: 'B', text: 'B' },
      ],
    });
    const displaySpy = vi.spyOn(StoryUI, 'displayFragment').mockReturnValue(true);

    const shown = StoryUI.showRunFragment(deps);

    expect(shown).toBe(false);
    expect(displaySpy).not.toHaveBeenCalled();
  });

  it('unlockNextFragment unlocks one unseen fragment at a time', () => {
    const deps = createDeps({
      storyPieces: [1],
      fragments: [
        { id: 1, run: 1, title: 'A', text: 'A' },
        { id: 2, run: 2, title: 'B', text: 'B' },
      ],
    });

    StoryUI.unlockNextFragment(deps);
    StoryUI.unlockNextFragment(deps);

    expect(deps.gs.meta.storyPieces).toEqual([1, 2]);
  });
});
