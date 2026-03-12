import { describe, expect, it, vi } from 'vitest';

import {
  createRewardRemoveCancelAction,
  startRewardRemoveUseCase,
} from '../game/app/reward/use_cases/claim_reward_use_case.js';

describe('start_reward_remove_use_case', () => {
  it('opens discard flow with unified reward navigation payload', () => {
    const gs = { _rewardLock: false };
    const doc = { id: 'doc' };
    const showCardDiscard = vi.fn();
    const returnActions = {
      returnFromReward: vi.fn(),
      returnToGame: vi.fn(),
      rewardActions: {
        returnFromReward: vi.fn(),
        returnToGame: vi.fn(),
      },
    };
    const lockRewardFlowFn = vi.fn();
    const setRewardPickedStateFn = vi.fn();

    const result = startRewardRemoveUseCase({
      buildRewardDiscardDepsFn: ({ onCancel, returnActions: forwarded }) => ({
        onCancel,
        ...forwarded,
      }),
      clearIdempotencyKeyFn: vi.fn(),
      doc,
      eventUI: { showCardDiscard },
      gs,
      isRewardFlowLockedFn: vi.fn().mockReturnValue(false),
      lockRewardFlowFn,
      rewardClaimKey: 'reward:claim',
      returnActions,
      setRewardPickedStateFn,
      unlockRewardFlowFn: vi.fn(),
    });

    expect(result).toEqual({ started: true, mode: 'discard' });
    expect(lockRewardFlowFn).toHaveBeenCalledWith(gs);
    expect(setRewardPickedStateFn).toHaveBeenCalledWith(doc, true);
    expect(showCardDiscard).toHaveBeenCalledWith(
      gs,
      true,
      expect.objectContaining({
        onCancel: expect.any(Function),
        returnFromReward: returnActions.returnFromReward,
        returnToGame: returnActions.returnToGame,
        rewardActions: expect.objectContaining({
          returnFromReward: expect.any(Function),
          returnToGame: expect.any(Function),
        }),
      }),
    );
  });

  it('returns immediately when no discard hook is available', () => {
    const returnFromReward = vi.fn();

    const result = startRewardRemoveUseCase({
      buildRewardDiscardDepsFn: vi.fn(),
      clearIdempotencyKeyFn: vi.fn(),
      doc: {},
      eventUI: undefined,
      gs: { _rewardLock: false },
      isRewardFlowLockedFn: vi.fn().mockReturnValue(false),
      lockRewardFlowFn: vi.fn(),
      rewardClaimKey: 'reward:claim',
      returnActions: { returnFromReward },
      setRewardPickedStateFn: vi.fn(),
      unlockRewardFlowFn: vi.fn(),
    });

    expect(result).toEqual({ started: true, mode: 'return' });
    expect(returnFromReward).toHaveBeenCalledTimes(1);
  });

  it('cancels remove flow by unlocking, clearing idempotency, and unmarking picked state', () => {
    const gs = {};
    const doc = {};
    const unlockRewardFlowFn = vi.fn();
    const clearIdempotencyKeyFn = vi.fn();
    const setRewardPickedStateFn = vi.fn();

    const onCancel = createRewardRemoveCancelAction({
      clearIdempotencyKeyFn,
      doc,
      gs,
      rewardClaimKey: 'reward:claim',
      setRewardPickedStateFn,
      unlockRewardFlowFn,
    });

    onCancel();

    expect(unlockRewardFlowFn).toHaveBeenCalledWith(gs);
    expect(clearIdempotencyKeyFn).toHaveBeenCalledWith('reward:claim');
    expect(setRewardPickedStateFn).toHaveBeenCalledWith(doc, false);
  });
});
