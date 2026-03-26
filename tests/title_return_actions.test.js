import { describe, expect, it, vi } from 'vitest';

import {
  completeTitleReturn,
  returnToTitleFromPause,
} from '../game/features/title/app/title_return_actions.js';

describe('title_return_actions', () => {
  it('replays title return side effects', () => {
    const deps = {
      showTitleScreen: vi.fn(),
      clearSelectedClass: vi.fn(),
      resetCharacterSelectState: vi.fn(),
      refreshRunModePanel: vi.fn(),
      refreshTitleSaveState: vi.fn(),
      showPendingClassProgressSummary: vi.fn(),
    };

    completeTitleReturn(deps);

    expect(deps.showTitleScreen).toHaveBeenCalledTimes(1);
    expect(deps.clearSelectedClass).toHaveBeenCalledTimes(1);
    expect(deps.resetCharacterSelectState).toHaveBeenCalledTimes(1);
    expect(deps.refreshRunModePanel).toHaveBeenCalledTimes(1);
    expect(deps.refreshTitleSaveState).toHaveBeenCalledTimes(1);
    expect(deps.showPendingClassProgressSummary).toHaveBeenCalledTimes(1);
  });

  it('saves and reloads when returning to title from pause', () => {
    const deps = {
      gs: { currentScreen: 'game' },
      saveRun: vi.fn(() => ({ status: 'saved', persisted: true })),
      reload: vi.fn(),
    };

    const result = returnToTitleFromPause(deps);

    expect(result).toBe(true);
    expect(deps.saveRun).toHaveBeenCalledWith({ gs: deps.gs });
    expect(deps.reload).toHaveBeenCalledTimes(1);
  });

  it('blocks reload and reports a warning when the save is only queued', () => {
    const deps = {
      gs: { currentScreen: 'game' },
      saveRun: vi.fn(() => ({ status: 'queued', persisted: false, queueDepth: 1 })),
      reload: vi.fn(),
      showSaveStatus: vi.fn(),
    };

    const result = returnToTitleFromPause(deps);

    expect(result).toBe(false);
    expect(deps.saveRun).toHaveBeenCalledWith({ gs: deps.gs });
    expect(deps.showSaveStatus).toHaveBeenCalledWith({
      status: 'queued',
      persisted: false,
      queueDepth: 1,
    });
    expect(deps.reload).not.toHaveBeenCalled();
  });
});
