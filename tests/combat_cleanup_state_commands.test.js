import { describe, expect, it, vi } from 'vitest';

import { applyCombatEndCleanupState } from '../game/features/combat/state/combat_cleanup_state_commands.js';
import { applyCombatPlayerCleanupReducerState } from '../game/features/combat/state/commands/combat_player_cleanup_state_commands.js';
import { applyCombatSessionCleanupReducerState } from '../game/features/combat/state/commands/combat_session_cleanup_state_commands.js';

describe('combat_cleanup_state_commands', () => {
  it('centralizes combat end cleanup without touching the player deck', () => {
    const state = {
      combat: {
        active: true,
        playerTurn: false,
        enemies: [{ hp: 5 }],
      },
      player: {
        deck: ['strike', 'guard'],
        hand: ['strike'],
        graveyard: ['guard'],
        exhausted: ['curse'],
        drawPile: ['a'],
        discardPile: ['b'],
        maxEnergy: 3,
        shield: 4,
        echoChain: 2,
        kills: 1,
        buffs: {},
        silenceGauge: 3,
        timeRiftGauge: 2,
      },
      stats: {
        damageDealt: 12,
        damageTaken: 5,
      },
      _maskCount: 1,
      _batteryUsedTurn: true,
      _temporalTurn: 2,
      _activeRegionId: 5,
      _ignoreShield: true,
      _scrollTempCard: 'tmp',
      _fragmentActive: true,
      _fragmentBaseMax: 3,
      _glitch0: 'g0',
      _glitchPlus: 'gp',
      _eternityActive: true,
    };

    const result = applyCombatEndCleanupState(state);

    expect(result).toEqual({ combatActive: false, playerTurn: true });
    expect(state.player.deck).toEqual(['strike', 'guard']);
    expect(state.player.hand).toEqual([]);
    expect(state.player.graveyard).toEqual([]);
    expect(state.player.exhausted).toEqual([]);
    expect(state.player.drawPile).toEqual([]);
    expect(state.player.discardPile).toEqual([]);
    expect(state.player.silenceGauge).toBe(0);
    expect(state._activeRegionId).toBeNull();
    expect(state._eternityActive).toBe(false);
  });

  it('prefers the combat end reducer when dispatch is available', () => {
    const state = {
      combat: {
        active: true,
        playerTurn: false,
      },
      player: {
        deck: [],
        hand: ['strike'],
      },
      dispatch: vi.fn((action, payload) => {
        if (action === 'combat:end') {
          state.combat.active = false;
          state.combat.playerTurn = true;
          state.player.hand = [];
          return { victory: payload.victory };
        }
        return null;
      }),
    };

    const result = applyCombatEndCleanupState(state);

    expect(state.dispatch).toHaveBeenCalledWith('combat:end', { victory: true });
    expect(result).toEqual({ victory: true });
    expect(state.player.hand).toEqual([]);
  });

  it('splits combat cleanup into player and session command helpers', () => {
    const state = {
      combat: { active: true, playerTurn: false },
      player: {
        hand: ['a'],
        graveyard: ['b'],
        exhausted: ['c'],
        drawPile: ['d'],
        discardPile: ['e'],
        silenceGauge: 2,
        timeRiftGauge: 3,
      },
      _maskCount: 1,
      _batteryUsedTurn: true,
      _temporalTurn: 2,
      _activeRegionId: 4,
      _ignoreShield: true,
      _scrollTempCard: 'tmp',
      _fragmentActive: true,
      _fragmentBaseMax: 2,
      _glitch0: 'g0',
      _glitchPlus: 'g1',
      _eternityActive: true,
    };

    expect(applyCombatPlayerCleanupReducerState(state)).toEqual({
      handSize: 0,
      graveyardSize: 0,
      exhaustedSize: 0,
    });
    expect(applyCombatSessionCleanupReducerState(state)).toEqual({
      combatActive: false,
      playerTurn: true,
    });
    expect(state._activeRegionId).toBeNull();
    expect(state._eternityActive).toBe(false);
  });
});
