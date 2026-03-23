import { describe, expect, it, vi } from 'vitest';

import {
  buildRewardDiscardDeps,
  createRewardReturnActions,
} from '../game/features/reward/public.js';

describe('reward_flow_presenter', () => {
  it('prefers rewardActions return handlers and falls back to returnToGame semantics', () => {
    const rewardActions = {
      returnFromReward: vi.fn(),
      returnToGame: vi.fn(),
    };
    const deps = {
      rewardActions,
      returnFromReward: vi.fn(),
      returnToGame: vi.fn(),
    };

    const actions = createRewardReturnActions(deps);
    actions.returnFromReward();
    actions.returnToGame(false);
    actions.returnToGame(true);

    expect(rewardActions.returnFromReward).toHaveBeenCalledTimes(2);
    expect(rewardActions.returnToGame).toHaveBeenCalledWith(false);
    expect(deps.returnFromReward).not.toHaveBeenCalled();
    expect(deps.returnToGame).not.toHaveBeenCalled();
  });

  it('builds discard deps with unified return actions and cancel callback', () => {
    const onCancel = vi.fn();
    const deps = {
      returnToGame: vi.fn(),
    };

    const payload = buildRewardDiscardDeps({ deps, onCancel });
    payload.returnFromReward();
    payload.returnToGame(false);

    expect(payload.onCancel).toBe(onCancel);
    expect(payload.rewardActions.returnFromReward).toBeTypeOf('function');
    expect(payload.rewardActions.returnToGame).toBeTypeOf('function');
    expect(deps.returnToGame).toHaveBeenNthCalledWith(1, true);
    expect(deps.returnToGame).toHaveBeenNthCalledWith(2, false);
  });
});
