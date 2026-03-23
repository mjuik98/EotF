import { afterEach, describe, expect, it, vi } from 'vitest';
import { showEndingRuntime, showRunFragmentRuntime } from '../game/features/ui/presentation/browser/story_ui_runtime.js';
import { EndingScreenUI } from '../game/features/ui/public.js';

describe('story_ui_runtime', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rolls back a newly unlocked fragment if the overlay fails to render', () => {
    const deps = {
      gs: {
        meta: {
          storyPieces: [],
          inscriptions: {},
          _hiddenEndingHinted: false,
        },
      },
      data: {
        storyFragments: [{ id: 1, run: 1, title: 'A', text: 'A' }],
        inscriptions: {},
      },
    };
    const ui = {
      displayFragment: vi.fn(() => false),
    };

    const shown = showRunFragmentRuntime(ui, deps);

    expect(shown).toBe(false);
    expect(ui.displayFragment).toHaveBeenCalledWith(
      { id: 1, run: 1, title: 'A', text: 'A' },
      deps,
    );
    expect(deps.gs.meta.storyPieces).toEqual([]);
  });

  it('delegates normal endings to EndingScreenUI', () => {
    const deps = {
      gs: {
        meta: {
          storyPieces: [1, 2],
          inscriptions: {},
        },
        player: { kills: 1 },
        stats: { damageDealt: 10 },
      },
    };
    const showSpy = vi.spyOn(EndingScreenUI, 'show').mockReturnValue(true);

    const shown = showEndingRuntime(false, deps);

    expect(shown).toBe(true);
    expect(showSpy).toHaveBeenCalledWith(false, deps);
  });
});
