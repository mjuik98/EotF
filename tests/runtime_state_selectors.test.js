import { describe, expect, it } from 'vitest';

import {
  canContinueCombatTurn,
  canShowNextNodeOverlay,
  isCombatResolutionPending,
  isNodeMovementLocked,
  isRewardFlowLocked,
} from '../game/app/shared/selectors/runtime_state_selectors.js';

describe('runtime_state_selectors', () => {
  it('reports shared runtime lock flags and combat resolution state', () => {
    const gs = {
      combat: { active: true },
      _rewardLock: true,
      _nodeMoveLock: true,
      _endCombatScheduled: false,
      _endCombatRunning: true,
    };

    expect(isRewardFlowLocked(gs)).toBe(true);
    expect(isNodeMovementLocked(gs)).toBe(true);
    expect(isCombatResolutionPending(gs)).toBe(true);
    expect(canContinueCombatTurn(gs)).toBe(false);
  });

  it('allows next-node overlay only when runtime locks are clear', () => {
    const gs = {
      currentScreen: 'game',
      combat: { active: false },
      _rewardLock: false,
      _nodeMoveLock: false,
      _endCombatScheduled: false,
      _endCombatRunning: false,
    };

    expect(canShowNextNodeOverlay(gs, [{ id: 'n1' }])).toBe(true);
    expect(canShowNextNodeOverlay({ ...gs, _rewardLock: true }, [{ id: 'n1' }])).toBe(false);
    expect(canShowNextNodeOverlay({ ...gs, combat: { active: true } }, [{ id: 'n1' }])).toBe(false);
  });
});
