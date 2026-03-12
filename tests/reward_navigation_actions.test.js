import { describe, expect, it, vi } from 'vitest';

import { createRewardNavigationActions } from '../game/features/event/app/reward_navigation_actions.js';

describe('reward_navigation_actions', () => {
  it('delegates reward return through RunReturnUI.returnFromReward when available', () => {
    const modules = {
      RunReturnUI: {
        returnFromReward: vi.fn(),
        returnToGame: vi.fn(),
      },
    };
    const ports = {
      getRunReturnDeps: vi.fn(() => ({ token: 'run-return-deps' })),
    };

    const actions = createRewardNavigationActions(modules, ports);
    actions.returnFromReward();
    actions.returnToGame(true);

    expect(modules.RunReturnUI.returnFromReward).toHaveBeenCalledTimes(2);
    expect(modules.RunReturnUI.returnFromReward).toHaveBeenCalledWith({ token: 'run-return-deps' });
    expect(modules.RunReturnUI.returnToGame).not.toHaveBeenCalled();
  });

  it('falls back to RunReturnUI.returnToGame for non-reward returns', () => {
    const modules = {
      RunReturnUI: {
        returnToGame: vi.fn(),
      },
    };
    const ports = {
      getRunReturnDeps: vi.fn(() => ({ token: 'run-return-deps' })),
    };

    const actions = createRewardNavigationActions(modules, ports);
    actions.returnToGame(false);
    actions.rewardActions.returnToGame(false);

    expect(modules.RunReturnUI.returnToGame).toHaveBeenCalledTimes(2);
    expect(modules.RunReturnUI.returnToGame).toHaveBeenCalledWith(false, { token: 'run-return-deps' });
  });
});
