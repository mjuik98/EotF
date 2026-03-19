import { describe, expect, it, vi } from 'vitest';
import { Actions } from '../game/core/store/state_actions.js';

import {
  applyCombatStartReducerState,
  enterCombatState,
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

  it('prefers reducer-driven combat entry actions when dispatch is available', () => {
    const state = {
      currentScreen: 'title',
      _activeRegionId: null,
      combat: {
        active: false,
        enemies: [],
      },
      dispatch: vi.fn((action, payload) => {
        if (action === Actions.COMBAT_START) {
          state.combat.active = true;
          state.currentScreen = 'game';
          return { enemyCount: payload.enemies.length };
        }
        if (action === Actions.COMBAT_REGION_SET) {
          state._activeRegionId = payload.regionId;
          return payload.regionId;
        }
        return null;
      }),
    };

    expect(setActiveCombatRegionState(state, { id: '7' })).toBe(7);
    expect(enterCombatState(state)).toEqual({ enemyCount: 0 });
    expect(state.dispatch).toHaveBeenCalledWith(Actions.COMBAT_REGION_SET, { regionId: 7 });
    expect(state.dispatch).toHaveBeenCalledWith(Actions.COMBAT_START, { enemies: [] });
  });
});
