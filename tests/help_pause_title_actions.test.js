import { describe, expect, it, vi } from 'vitest';

import {
  buildTitleHelpPauseActions,
  confirmPauseReturnToTitle,
} from '../game/features/title/application/help_pause_title_actions.js';

describe('help_pause_title_actions', () => {
  it('prefers injected title-return and ending action helpers', () => {
    const returnToTitleFromPause = vi.fn(() => true);
    const restart = vi.fn();
    const selectFragment = vi.fn();
    const openCodex = vi.fn();

    const actions = buildTitleHelpPauseActions({
      returnToTitleFromPause,
      endingActions: {
        restart,
        selectFragment,
        openCodex,
      },
    });

    expect(actions.returnToTitleFromPause()).toBe(true);
    actions.restartEndingFlow();
    actions.selectEndingFragment('echo_boost');
    actions.openEndingCodex();

    expect(returnToTitleFromPause).toHaveBeenCalledTimes(1);
    expect(restart).toHaveBeenCalledTimes(1);
    expect(selectFragment).toHaveBeenCalledWith('echo_boost');
    expect(openCodex).toHaveBeenCalledTimes(1);
  });

  it('falls back to saving and reloading when no title-return helper is injected', () => {
    const saveRun = vi.fn();
    const reload = vi.fn();
    const deps = {
      gs: { currentScreen: 'game' },
      saveRun,
      reload,
    };

    expect(confirmPauseReturnToTitle(deps)).toBe(true);
    expect(saveRun).toHaveBeenCalledWith({ gs: deps.gs });
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
