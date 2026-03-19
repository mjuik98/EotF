import { describe, expect, it, vi } from 'vitest';
import { Actions } from '../game/core/store/state_actions.js';

import {
  addCombatEnemyState,
  prepareCombatDeckState,
  resetCombatSetupState,
  syncCombatSelectedTargetState,
} from '../game/features/combat/state/combat_setup_state_commands.js';

describe('combat_setup_state_commands', () => {
  it('resets combat setup state while preserving permanent buffs only', () => {
    const state = {
      combat: {
        enemies: [{ hp: 12 }],
        turn: 9,
        playerTurn: false,
        log: ['x'],
        bossDefeated: true,
        miniBossDefeated: true,
      },
      player: {
        maxEnergy: 4,
        shield: 8,
        echoChain: 3,
        buffs: {
          echo_berserk: 2,
          temp_boost: 1,
        },
        kills: 7,
      },
      stats: {
        damageDealt: 12,
        damageTaken: 4,
      },
      _selectedTarget: 3,
    };

    resetCombatSetupState(state);

    expect(state.combat.enemies).toEqual([]);
    expect(state.combat.turn).toBe(1);
    expect(state.combat.playerTurn).toBe(true);
    expect(state.player.energy).toBe(4);
    expect(state.player.buffs).toEqual({ echo_berserk: 2 });
    expect(state._combatStartDmg).toBe(12);
    expect(state._combatStartTaken).toBe(4);
    expect(state._combatStartKills).toBe(7);
  });

  it('prepares combat deck state, appends enemies, and syncs selected target', () => {
    const state = {
      combat: { enemies: [] },
      player: {
        deck: ['a', 'b'],
      },
    };

    prepareCombatDeckState(state);
    addCombatEnemyState(state, { hp: 0, id: 'dead' });
    addCombatEnemyState(state, { hp: 5, id: 'alive' });
    const selectedTarget = syncCombatSelectedTargetState(state);

    expect(state.player.drawPile).toEqual(['a', 'b']);
    expect(state.player.discardPile).toEqual([]);
    expect(state.player.hand).toEqual([]);
    expect(selectedTarget).toBe(1);
  });

  it('prefers reducer-driven combat setup actions when dispatch is available', () => {
    const state = {
      combat: {
        enemies: [],
        turn: 9,
        playerTurn: false,
        log: ['x'],
      },
      player: {
        deck: ['a', 'b'],
        maxEnergy: 4,
      },
      dispatch: vi.fn((action, payload) => {
        if (action === Actions.COMBAT_SETUP_RESET) {
          state.combat.turn = 1;
          state.player.energy = state.player.maxEnergy;
          return { turn: 1, selectedTarget: null };
        }
        if (action === Actions.COMBAT_DECK_PREPARE) {
          state.player.drawPile = [...state.player.deck];
          state.player.discardPile = [];
          state.player.hand = [];
          return {
            drawPile: state.player.drawPile,
            discardPile: state.player.discardPile,
            hand: state.player.hand,
          };
        }
        if (action === Actions.COMBAT_ENEMY_ADD) {
          state.combat.enemies.push(payload.enemy);
          return payload.enemy;
        }
        if (action === Actions.COMBAT_SELECTED_TARGET_SYNC) {
          state._selectedTarget = 0;
          return 0;
        }
        return null;
      }),
    };

    resetCombatSetupState(state);
    prepareCombatDeckState(state);
    addCombatEnemyState(state, { hp: 5, id: 'alive' });
    const selectedTarget = syncCombatSelectedTargetState(state);

    expect(state.dispatch).toHaveBeenCalledWith(Actions.COMBAT_SETUP_RESET, {});
    expect(state.dispatch).toHaveBeenCalledWith(Actions.COMBAT_DECK_PREPARE, {});
    expect(state.dispatch).toHaveBeenCalledWith(Actions.COMBAT_ENEMY_ADD, { enemy: { hp: 5, id: 'alive' } });
    expect(state.dispatch).toHaveBeenCalledWith(Actions.COMBAT_SELECTED_TARGET_SYNC, {});
    expect(selectedTarget).toBe(0);
  });
});
