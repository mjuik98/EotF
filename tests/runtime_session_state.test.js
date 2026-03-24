import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import * as compatSelectors from '../game/shared/state/runtime_session_selectors.js';
import * as sharedState from '../game/shared/state/public.js';

describe('runtime session state surfaces', () => {
  it('removes the legacy state command compat files once canonical owners are in place', () => {
    expect(
      fs.existsSync(path.join(process.cwd(), 'game/state/commands/combat_runtime_commands.js')),
    ).toBe(false);
    expect(
      fs.existsSync(path.join(process.cwd(), 'game/state/commands/run_outcome_commands.js')),
    ).toBe(false);
  });

  it('keeps the legacy selector surface wired to shared runtime session selectors', () => {
    expect(compatSelectors.isRewardFlowLocked).toBe(sharedState.isRewardFlowLocked);
    expect(compatSelectors.isNodeMovementLocked).toBe(sharedState.isNodeMovementLocked);
    expect(compatSelectors.isCombatResolutionPending).toBe(sharedState.isCombatResolutionPending);
    expect(compatSelectors.canShowNextNodeOverlay).toBe(sharedState.canShowNextNodeOverlay);
  });

  it('updates and reads runtime session flags through the shared state surface', () => {
    const gs = {
      currentScreen: 'game',
      combat: { active: true, enemies: [{ hp: 2 }, { hp: 0 }] },
      worldMemory: {},
      player: { class: 'guardian', shield: 9 },
      _rewardLock: false,
      _eventLock: false,
      _nodeMoveLock: false,
      _selectedTarget: 9,
      _bossRewardPending: true,
      _bossLastRegion: true,
      _endCombatRunning: false,
      _endCombatScheduled: false,
    };

    expect(sharedState.beginCombatResolution(gs)).toBe(true);
    expect(sharedState.isCombatResolutionPending(gs)).toBe(true);
    expect(sharedState.setRewardLock(gs, true)).toBe(true);
    expect(sharedState.isRewardFlowLocked(gs)).toBe(true);
    expect(sharedState.setNodeMoveLock(gs, true)).toBe(true);
    expect(sharedState.isNodeMovementLocked(gs)).toBe(true);
    expect(sharedState.syncSelectedTarget(gs)).toBe(0);
    expect(sharedState.recordEnemyWorldKill(gs, 'slime')).toBe(1);
    expect(sharedState.syncGuardianPreservedShield(gs)).toBe(4);
    expect(sharedState.canShowNextNodeOverlay(gs, ['next'])).toBe(false);
    expect(sharedState.consumeBossRewardState(gs)).toEqual({ pending: true, lastRegion: true });
    expect(sharedState.completeCombatResolution(gs)).toEqual({ running: false, scheduled: false });
  });
});
