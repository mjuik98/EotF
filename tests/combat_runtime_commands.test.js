import { describe, expect, it } from 'vitest';

import {
  beginCombatResolution,
  completeCombatResolution,
  consumeBossRewardState,
  recordEnemyWorldKill,
  resetInteractionLocks,
  replaceCombatEnemies,
  resetPlayerEchoChain,
  scheduleCombatEnd,
  setEventLock,
  setNodeMoveLock,
  setBossRewardState,
  setCombatActive,
  setRewardLock,
  syncGuardianPreservedShield,
  syncSelectedTarget,
} from '../game/shared/state/public.js';

describe('combat_runtime_commands', () => {
  it('centralizes combat resolution flags and combat state', () => {
    const gs = {
      combat: { active: true, playerTurn: true, enemies: [{ hp: 3 }, { hp: 1 }] },
      player: { echoChain: 6 },
      worldMemory: {},
      _endCombatRunning: false,
      _endCombatScheduled: false,
      _selectedTarget: 4,
      _rewardLock: true,
      _nodeMoveLock: true,
      _eventLock: true,
      dispatch: null,
    };

    expect(beginCombatResolution(gs)).toBe(true);
    expect(beginCombatResolution(gs)).toBe(false);
    expect(scheduleCombatEnd(gs)).toBe(true);
    expect(gs.combat.playerTurn).toBe(false);
    expect(setCombatActive(gs, false)).toBe(false);
    expect(setBossRewardState(gs, { pending: true, lastRegion: true })).toEqual({
      pending: true,
      lastRegion: true,
    });
    expect(consumeBossRewardState(gs)).toEqual({ pending: true, lastRegion: true });
    expect(setRewardLock(gs, true)).toBe(true);
    expect(setNodeMoveLock(gs, true)).toBe(true);
    expect(setEventLock(gs, true)).toBe(true);
    expect(resetInteractionLocks(gs)).toEqual({ reward: false, nodeMove: false, event: false });
    replaceCombatEnemies(gs, [{ hp: 2 }]);
    expect(syncSelectedTarget(gs)).toBe(0);
    expect(resetPlayerEchoChain(gs)).toBe(0);
    expect(syncGuardianPreservedShield({
      player: { class: 'guardian', shield: 5 },
    })).toBe(2);
    expect(recordEnemyWorldKill(gs, 'wolf')).toBe(1);
    expect(completeCombatResolution(gs)).toEqual({ running: false, scheduled: false });
  });

  it('tracks boss kills separately in meta progression when the defeated enemy is a boss', () => {
    const gs = {
      combat: { active: true, playerTurn: true, enemies: [] },
      player: { echoChain: 0 },
      worldMemory: {},
      meta: { progress: { bossKills: {} } },
      _endCombatRunning: false,
      _endCombatScheduled: false,
      _selectedTarget: null,
      _rewardLock: false,
      _nodeMoveLock: false,
      _eventLock: false,
    };

    expect(recordEnemyWorldKill(gs, 'silent_tyrant', { isBoss: true })).toBe(1);
    expect(gs.worldMemory.killed_silent_tyrant).toBe(1);
    expect(gs.meta.progress.bossKills.silent_tyrant).toBe(1);
  });
});
