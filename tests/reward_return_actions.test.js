import { describe, expect, it, vi } from 'vitest';

import { createRewardReturnActions } from '../game/shared/runtime/reward_return_actions.js';

describe('reward_return_actions', () => {
  it('prefers rewardActions when present', () => {
    const rewardActions = {
      returnFromReward: vi.fn(),
      returnToGame: vi.fn(),
    };

    const actions = createRewardReturnActions({
      rewardActions,
      returnFromReward: vi.fn(),
      returnToGame: vi.fn(),
    });

    actions.returnFromReward();
    actions.returnToGame(false);
    actions.returnToGame(true);

    expect(rewardActions.returnFromReward).toHaveBeenCalledTimes(2);
    expect(rewardActions.returnToGame).toHaveBeenCalledTimes(1);
    expect(rewardActions.returnToGame).toHaveBeenCalledWith(false);
  });

  it('falls back to returnToGame semantics when explicit reward return is missing', () => {
    const returnToGame = vi.fn();
    const actions = createRewardReturnActions({ returnToGame });

    actions.returnFromReward();
    actions.returnToGame(false);

    expect(returnToGame).toHaveBeenNthCalledWith(1, true);
    expect(returnToGame).toHaveBeenNthCalledWith(2, false);
  });
});
