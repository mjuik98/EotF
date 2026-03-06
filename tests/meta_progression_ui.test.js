import { describe, expect, it, vi } from 'vitest';

import { MetaProgressionUI } from '../game/ui/screens/meta_progression_ui.js';

describe('MetaProgressionUI', () => {
  it('replays pending class summary after returning to title from fragment selection', () => {
    vi.useFakeTimers();

    const switchScreen = vi.fn();
    const clearSelectedClass = vi.fn();
    const refreshRunModePanel = vi.fn();
    const showPendingClassProgressSummary = vi.fn();
    const gs = {
      meta: {
        echoFragments: 3,
        inscriptions: {},
      },
    };

    MetaProgressionUI.selectFragment('echo_boost', {
      gs,
      switchScreen,
      clearSelectedClass,
      refreshRunModePanel,
      showPendingClassProgressSummary,
    });

    vi.advanceTimersByTime(500);

    expect(gs.meta.echoFragments).toBe(2);
    expect(gs.meta.inscriptions.echo_boost).toBe(true);
    expect(switchScreen).toHaveBeenCalledWith('title');
    expect(clearSelectedClass).toHaveBeenCalledTimes(1);
    expect(refreshRunModePanel).toHaveBeenCalledTimes(1);
    expect(showPendingClassProgressSummary).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('replays pending class summary after closing ending screen', () => {
    const remove = vi.fn();
    const doc = {
      getElementById: vi.fn(() => ({ remove })),
    };
    const switchScreen = vi.fn();
    const clearSelectedClass = vi.fn();
    const refreshRunModePanel = vi.fn();
    const showPendingClassProgressSummary = vi.fn();

    MetaProgressionUI.restartFromEnding({
      doc,
      switchScreen,
      clearSelectedClass,
      refreshRunModePanel,
      showPendingClassProgressSummary,
    });

    expect(remove).toHaveBeenCalledTimes(1);
    expect(switchScreen).toHaveBeenCalledWith('title');
    expect(clearSelectedClass).toHaveBeenCalledTimes(1);
    expect(refreshRunModePanel).toHaveBeenCalledTimes(1);
    expect(showPendingClassProgressSummary).toHaveBeenCalledTimes(1);
  });
});
