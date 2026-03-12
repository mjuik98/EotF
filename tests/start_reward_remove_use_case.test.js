import { describe, expect, it, vi } from 'vitest';

import {
  createRewardRemoveCancelAction,
  startRewardRemoveUseCase,
} from '../game/app/reward/use_cases/claim_reward_use_case.js';

describe('start_reward_remove_use_case', () => {
  it('opens discard flow with unified reward navigation payload', () => {
    const gs = { _rewardLock: false };
    const openRewardRemoveDiscard = vi.fn().mockImplementation(({ gs: forwardedGs, isBurn, deps }) => {
      expect(forwardedGs).toBe(gs);
      expect(isBurn).toBe(true);
      expect(deps).toEqual(expect.objectContaining({
        onCancel: expect.any(Function),
      }));
      return true;
    });
    const returnActions = {
      returnFromReward: vi.fn(),
      returnToGame: vi.fn(),
      rewardActions: {
        returnFromReward: vi.fn(),
        returnToGame: vi.fn(),
      },
    };
    const lockRewardFlowFn = vi.fn();
    const setRewardPickedState = vi.fn();

    const result = startRewardRemoveUseCase({
      buildRewardDiscardDepsFn: ({ onCancel, returnActions: forwarded }) => ({
        onCancel,
        ...forwarded,
      }),
      clearIdempotencyKeyFn: vi.fn(),
      gs,
      isRewardFlowLockedFn: vi.fn().mockReturnValue(false),
      lockRewardFlowFn,
      openRewardRemoveDiscard,
      rewardClaimKey: 'reward:claim',
      returnActions,
      setRewardPickedState,
      unlockRewardFlowFn: vi.fn(),
    });

    expect(result).toEqual({ started: true, mode: 'discard' });
    expect(lockRewardFlowFn).toHaveBeenCalledWith(gs);
    expect(setRewardPickedState).toHaveBeenCalledWith(true);
    expect(openRewardRemoveDiscard).toHaveBeenCalledWith(expect.objectContaining({
      gs,
      isBurn: true,
      deps: expect.objectContaining({
        onCancel: expect.any(Function),
        returnFromReward: returnActions.returnFromReward,
        returnToGame: returnActions.returnToGame,
        rewardActions: expect.objectContaining({
          returnFromReward: expect.any(Function),
          returnToGame: expect.any(Function),
        }),
      }),
    }));
  });

  it('returns immediately when no discard hook is available', () => {
    const returnFromReward = vi.fn();

    const result = startRewardRemoveUseCase({
      buildRewardDiscardDepsFn: vi.fn(),
      clearIdempotencyKeyFn: vi.fn(),
      gs: { _rewardLock: false },
      isRewardFlowLockedFn: vi.fn().mockReturnValue(false),
      lockRewardFlowFn: vi.fn(),
      openRewardRemoveDiscard: vi.fn().mockReturnValue(false),
      rewardClaimKey: 'reward:claim',
      returnActions: { returnFromReward },
      setRewardPickedState: vi.fn(),
      unlockRewardFlowFn: vi.fn(),
    });

    expect(result).toEqual({ started: true, mode: 'return' });
    expect(returnFromReward).toHaveBeenCalledTimes(1);
  });

  it('cancels remove flow by unlocking, clearing idempotency, and unmarking picked state', () => {
    const gs = {};
    const unlockRewardFlowFn = vi.fn();
    const clearIdempotencyKeyFn = vi.fn();
    const setRewardPickedState = vi.fn();

    const onCancel = createRewardRemoveCancelAction({
      clearIdempotencyKeyFn,
      gs,
      rewardClaimKey: 'reward:claim',
      setRewardPickedState,
      unlockRewardFlowFn,
    });

    onCancel();

    expect(unlockRewardFlowFn).toHaveBeenCalledWith(gs);
    expect(clearIdempotencyKeyFn).toHaveBeenCalledWith('reward:claim');
    expect(setRewardPickedState).toHaveBeenCalledWith(false);
  });
});
