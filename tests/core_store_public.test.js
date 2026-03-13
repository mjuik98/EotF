import { describe, expect, it } from 'vitest';

import { GS } from '../game/core/store/game_state.js';
import { Actions, Reducers } from '../game/core/store/state_actions.js';
import {
  selectCombatState,
  selectCurrentScreen,
  selectMetaState,
  selectPlayerState,
  selectStatsState,
} from '../game/core/store/selectors.js';

describe('core store public surface', () => {
  it('re-exports the canonical game state and reducer surface', () => {
    expect(GS).toBeDefined();
    expect(Actions.PLAYER_HEAL).toBe('player:heal');
    expect(Reducers[Actions.PLAYER_HEAL]).toBeTypeOf('function');
  });

  it('provides narrow selectors for state-oriented consumers', () => {
    const gs = {
      currentScreen: 'game',
      player: { hp: 10 },
      combat: { active: true },
      meta: { runCount: 2 },
      stats: { damageTaken: 5 },
    };

    expect(selectCurrentScreen(gs)).toBe('game');
    expect(selectPlayerState(gs)).toBe(gs.player);
    expect(selectCombatState(gs)).toBe(gs.combat);
    expect(selectMetaState(gs)).toBe(gs.meta);
    expect(selectStatsState(gs)).toBe(gs.stats);
  });
});
