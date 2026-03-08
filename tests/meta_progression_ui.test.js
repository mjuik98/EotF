import { describe, expect, it, vi } from 'vitest';

import { EndingScreenUI } from '../game/ui/screens/ending_screen_ui.js';
import { MetaProgressionUI } from '../game/ui/screens/meta_progression_ui.js';

describe('MetaProgressionUI', () => {
  it('replays pending class summary after returning to title from fragment selection', () => {
    vi.useFakeTimers();

    const switchScreen = vi.fn();
    const clearSelectedClass = vi.fn();
    const refreshRunModePanel = vi.fn();
    const showPendingClassProgressSummary = vi.fn();
    const doc = { getElementById: vi.fn() };
    const cleanupSpy = vi.spyOn(EndingScreenUI, 'cleanup').mockImplementation(() => {});
    const gs = {
      meta: {
        echoFragments: 3,
        inscriptions: {},
      },
    };

    MetaProgressionUI.selectFragment('echo_boost', {
      doc,
      gs,
      switchScreen,
      clearSelectedClass,
      refreshRunModePanel,
      showPendingClassProgressSummary,
    });

    vi.advanceTimersByTime(500);

    expect(gs.meta.echoFragments).toBe(2);
    expect(gs.meta.inscriptions.echo_boost).toBe(true);
    expect(cleanupSpy).toHaveBeenCalledWith({ doc });
    expect(switchScreen).toHaveBeenCalledWith('title');
    expect(clearSelectedClass).toHaveBeenCalledTimes(1);
    expect(refreshRunModePanel).toHaveBeenCalledTimes(1);
    expect(showPendingClassProgressSummary).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('replays pending class summary after closing ending screen', () => {
    const doc = { getElementById: vi.fn() };
    const switchScreen = vi.fn();
    const clearSelectedClass = vi.fn();
    const refreshRunModePanel = vi.fn();
    const showPendingClassProgressSummary = vi.fn();
    const cleanupSpy = vi.spyOn(EndingScreenUI, 'cleanup').mockImplementation(() => {});

    MetaProgressionUI.restartFromEnding({
      doc,
      switchScreen,
      clearSelectedClass,
      refreshRunModePanel,
      showPendingClassProgressSummary,
    });

    expect(cleanupSpy).toHaveBeenCalledWith({ doc });
    expect(switchScreen).toHaveBeenCalledWith('title');
    expect(clearSelectedClass).toHaveBeenCalledTimes(1);
    expect(refreshRunModePanel).toHaveBeenCalledTimes(1);
    expect(showPendingClassProgressSummary).toHaveBeenCalledTimes(1);
  });
});
