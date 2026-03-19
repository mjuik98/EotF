import { describe, expect, it } from 'vitest';

import * as compat from '../game/app/shared/use_cases/runtime_state_use_case.js';
import * as shared from '../game/shared/state/runtime_flow_controls.js';
import * as sharedPublic from '../game/shared/state/public.js';
import { Actions, Reducers } from '../game/core/store/state_actions.js';

describe('runtime_flow_controls', () => {
  it('keeps the app compatibility surface wired to the shared runtime flow module', () => {
    expect(compat.activateCombat).toBe(shared.activateCombat);
    expect(compat.deactivateCombat).toBe(shared.deactivateCombat);
    expect(shared.lockEventFlow).toBe(sharedPublic.lockEventFlow);
    expect(shared.isEventFlowLocked).toBe(sharedPublic.isEventFlowLocked);
    expect(compat.lockRewardFlow).toBe(shared.lockRewardFlow);
    expect(compat.unlockRewardFlow).toBe(shared.unlockRewardFlow);
    expect(compat.unlockEventFlow).toBe(shared.unlockEventFlow);
    expect(compat.setNodeMovementLocked).toBe(shared.setNodeMovementLocked);
    expect(compat.resetRuntimeInteractionState).toBe(shared.resetRuntimeInteractionState);
    expect(compat.consumeBossRewardFlags).toBe(shared.consumeBossRewardFlags);
  });

  it('keeps canonical state actions on the core store surface and runtime controls on the shared public state surface', () => {
    expect(Actions.PLAYER_HEAL).toBe('player:heal');
    expect(Reducers[Actions.PLAYER_HEAL]).toBeTypeOf('function');
    expect(sharedPublic.Actions).toBeUndefined();
    expect(sharedPublic.Reducers).toBeUndefined();
    expect(sharedPublic.activateCombat).toBe(shared.activateCombat);
    expect(sharedPublic.lockEventFlow).toBe(shared.lockEventFlow);
    expect(sharedPublic.resetRuntimeInteractionState).toBe(shared.resetRuntimeInteractionState);
  });

  it('applies runtime lock and combat state updates through the shared surface', () => {
    const gs = {
      combat: { active: false },
      _rewardLock: false,
      _eventLock: true,
      _nodeMoveLock: false,
      _endCombatRunning: true,
      _endCombatScheduled: true,
      _bossRewardPending: true,
      _bossLastRegion: true,
    };

    expect(shared.activateCombat(gs)).toBe(true);
    expect(shared.lockEventFlow(gs)).toBe(true);
    expect(shared.isEventFlowLocked(gs)).toBe(true);
    expect(shared.lockRewardFlow(gs)).toBe(true);
    expect(shared.unlockEventFlow(gs)).toBe(false);
    expect(shared.setNodeMovementLocked(gs, true)).toBe(true);
    expect(shared.consumeBossRewardFlags(gs)).toEqual({ pending: true, lastRegion: true });
    expect(shared.resetRuntimeInteractionState(gs)).toBe(gs);
    expect(shared.deactivateCombat(gs)).toBe(false);

    expect(gs).toEqual(expect.objectContaining({
      _bossLastRegion: false,
      _bossRewardPending: false,
      _endCombatRunning: false,
      _endCombatScheduled: false,
      _eventLock: false,
      _nodeMoveLock: false,
      _rewardLock: false,
    }));
  });
});
