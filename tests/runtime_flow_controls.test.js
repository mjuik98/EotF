import { describe, expect, it } from 'vitest';

import * as compat from '../game/app/shared/use_cases/runtime_state_use_case.js';
import * as shared from '../game/shared/state/runtime_flow_controls.js';

describe('runtime_flow_controls', () => {
  it('keeps the app compatibility surface wired to the shared runtime flow module', () => {
    expect(compat.activateCombat).toBe(shared.activateCombat);
    expect(compat.deactivateCombat).toBe(shared.deactivateCombat);
    expect(compat.lockRewardFlow).toBe(shared.lockRewardFlow);
    expect(compat.unlockRewardFlow).toBe(shared.unlockRewardFlow);
    expect(compat.unlockEventFlow).toBe(shared.unlockEventFlow);
    expect(compat.setNodeMovementLocked).toBe(shared.setNodeMovementLocked);
    expect(compat.resetRuntimeInteractionState).toBe(shared.resetRuntimeInteractionState);
    expect(compat.consumeBossRewardFlags).toBe(shared.consumeBossRewardFlags);
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
