import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EndingScreenUI } from '../game/ui/screens/ending_screen_ui.js';
import {
  restartFromEndingRuntime,
  selectMetaFragmentRuntime,
} from '../game/ui/screens/meta_progression_ui_runtime.js';

describe('meta_progression_ui_runtime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('applies a fragment effect and schedules title-return side effects', () => {
    const cleanupSpy = vi.spyOn(EndingScreenUI, 'cleanup').mockImplementation(() => {});
    const showTitleScreen = vi.fn();
    const clearSelectedClass = vi.fn();
    const refreshRunModePanel = vi.fn();
    const refreshTitleSaveState = vi.fn();
    const showPendingClassProgressSummary = vi.fn();
    const deps = {
      doc: { id: 'doc' },
      gs: {
        meta: {
          echoFragments: 2,
          inscriptions: {},
        },
      },
      showTitleScreen,
      clearSelectedClass,
      refreshRunModePanel,
      refreshTitleSaveState,
      showPendingClassProgressSummary,
    };

    const selected = selectMetaFragmentRuntime('fortune', deps);

    expect(selected).toBe(true);
    expect(cleanupSpy).toHaveBeenCalledWith({ doc: deps.doc });
    expect(deps.gs.meta.echoFragments).toBe(1);
    expect(deps.gs.meta.inscriptions.fortune).toBe(true);

    vi.advanceTimersByTime(500);

    expect(showTitleScreen).toHaveBeenCalledTimes(1);
    expect(clearSelectedClass).toHaveBeenCalledTimes(1);
    expect(refreshRunModePanel).toHaveBeenCalledTimes(1);
    expect(refreshTitleSaveState).toHaveBeenCalledTimes(1);
    expect(showPendingClassProgressSummary).toHaveBeenCalledTimes(1);
  });

  it('replays title-return side effects when restarting from the ending screen', () => {
    const cleanupSpy = vi.spyOn(EndingScreenUI, 'cleanup').mockImplementation(() => {});
    const deps = {
      doc: { id: 'doc' },
      showTitleScreen: vi.fn(),
      clearSelectedClass: vi.fn(),
      refreshRunModePanel: vi.fn(),
      refreshTitleSaveState: vi.fn(),
      showPendingClassProgressSummary: vi.fn(),
    };

    restartFromEndingRuntime(deps);

    expect(cleanupSpy).toHaveBeenCalledWith({ doc: deps.doc });
    expect(deps.showTitleScreen).toHaveBeenCalledTimes(1);
    expect(deps.clearSelectedClass).toHaveBeenCalledTimes(1);
    expect(deps.refreshRunModePanel).toHaveBeenCalledTimes(1);
    expect(deps.refreshTitleSaveState).toHaveBeenCalledTimes(1);
    expect(deps.showPendingClassProgressSummary).toHaveBeenCalledTimes(1);
  });

  it('prefers the injected completeTitleReturn helper over direct callbacks', () => {
    const cleanupSpy = vi.spyOn(EndingScreenUI, 'cleanup').mockImplementation(() => {});
    const completeTitleReturn = vi.fn();
    const deps = {
      doc: { id: 'doc' },
      completeTitleReturn,
      showTitleScreen: vi.fn(),
    };

    restartFromEndingRuntime(deps);

    expect(cleanupSpy).toHaveBeenCalledWith({ doc: deps.doc });
    expect(completeTitleReturn).toHaveBeenCalledTimes(1);
    expect(deps.showTitleScreen).not.toHaveBeenCalled();
  });
});
