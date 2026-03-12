import { describe, expect, it, vi } from 'vitest';

import {
  scheduleRewardReturnUseCase,
  takeRewardClaimUseCase,
} from '../game/app/reward/use_cases/claim_reward_use_case.js';

describe('reward_claim_flow_use_case', () => {
  it('applies common reward-claim side effects through injected collaborators', () => {
    const gs = { _rewardLock: false };
    const doc = { id: 'doc' };
    const deps = {
      id: 'deps',
    };
    const claimRewardFn = vi.fn().mockReturnValue({
      success: true,
      notification: {
        payload: { id: 'item' },
        options: { forceQueue: true },
      },
    });
    const lockRewardFlowFn = vi.fn();
    const setRewardPickedStateFn = vi.fn();
    const playRewardClaimFeedbackFn = vi.fn();
    const scheduleRewardReturn = vi.fn();
    const showItemToast = vi.fn();
    const returnFromReward = vi.fn();

    const result = takeRewardClaimUseCase({
      deps,
      doc,
      gs,
      rewardType: 'item',
      rewardId: 'relic',
      claimRewardFn,
      feedbackDeps: deps,
      isRewardFlowLockedFn: vi.fn().mockReturnValue(false),
      lockRewardFlowFn,
      returnFromReward,
      setRewardPickedStateFn,
      playRewardClaimFeedbackFn,
      scheduleRewardReturnFn: scheduleRewardReturn,
      showItemToast,
    });

    expect(result.success).toBe(true);
    expect(claimRewardFn).toHaveBeenCalledWith({
      data: undefined,
      gs,
      rewardId: 'relic',
      rewardType: 'item',
    });
    expect(lockRewardFlowFn).toHaveBeenCalledWith(gs);
    expect(setRewardPickedStateFn).toHaveBeenCalledWith(doc, true);
    expect(playRewardClaimFeedbackFn).toHaveBeenCalledWith(deps);
    expect(showItemToast).toHaveBeenCalledWith({ id: 'item' }, { forceQueue: true });
    expect(scheduleRewardReturn).toHaveBeenCalledWith({ returnFromReward });
  });

  it('supports upgrade-style claims that should not mark the reward list as picked', () => {
    const deps = { gs: {} };
    const setRewardPickedStateFn = vi.fn();

    takeRewardClaimUseCase({
      deps,
      doc: undefined,
      gs: {},
      rewardType: 'upgrade',
      markPicked: false,
      claimRewardFn: vi.fn().mockReturnValue({ success: true }),
      feedbackDeps: deps,
      isRewardFlowLockedFn: vi.fn().mockReturnValue(false),
      lockRewardFlowFn: vi.fn(),
      returnFromReward: vi.fn(),
      setRewardPickedStateFn,
      playRewardClaimFeedbackFn: vi.fn(),
      scheduleRewardReturnFn: vi.fn(),
    });

    expect(setRewardPickedStateFn).not.toHaveBeenCalled();
  });

  it('calls failure callback without applying success side effects', () => {
    const onFailure = vi.fn();
    const lockRewardFlowFn = vi.fn();

    const result = takeRewardClaimUseCase({
      gs: {},
      rewardType: 'blessing',
      claimRewardFn: vi.fn().mockReturnValue({ success: false, reason: 'max-energy' }),
      isRewardFlowLockedFn: vi.fn().mockReturnValue(false),
      lockRewardFlowFn,
      setRewardPickedStateFn: vi.fn(),
      playRewardClaimFeedbackFn: vi.fn(),
      scheduleRewardReturnFn: vi.fn(),
      returnFromReward: vi.fn(),
      onFailure,
    });

    expect(result).toEqual({ success: false, reason: 'max-energy' });
    expect(onFailure).toHaveBeenCalledWith({ success: false, reason: 'max-energy' });
    expect(lockRewardFlowFn).not.toHaveBeenCalled();
  });

  it('schedules a deferred reward return through the provided timer and return actions', () => {
    const setTimeoutFn = vi.fn((fn) => fn());
    const returnFromReward = vi.fn();

    scheduleRewardReturnUseCase({
      delayMs: 120,
      returnFromReward,
      setTimeoutFn,
    });

    expect(setTimeoutFn).toHaveBeenCalledWith(expect.any(Function), 120);
    expect(returnFromReward).toHaveBeenCalledTimes(1);
  });
});
