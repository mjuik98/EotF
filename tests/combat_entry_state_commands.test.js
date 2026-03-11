import { describe, expect, it } from 'vitest';

import {
  applyCombatStartReducerState,
  setActiveCombatRegionState,
} from '../game/features/combat/state/combat_entry_state_commands.js';

describe('combat_entry_state_commands', () => {
  it('applies reducer-owned combat start state in one place', () => {
    const state = {
      currentScreen: 'title',
      combat: {
        active: false,
        turn: 9,
        playerTurn: false,
        log: ['old'],
      },
    };

    const result = applyCombatStartReducerState(state);

    expect(result).toEqual({
      active: true,
      turn: 0,
      playerTurn: true,
      currentScreen: 'game',
    });
    expect(state.combat.log).toEqual([]);
  });

  it('tracks the active combat region id from region data', () => {
    const state = { _activeRegionId: 3 };

    expect(setActiveCombatRegionState(state, { id: '5' })).toBe(5);
    expect(state._activeRegionId).toBe(5);
    expect(setActiveCombatRegionState(state, null)).toBeNull();
  });
});
