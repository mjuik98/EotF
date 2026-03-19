import { describe, expect, it, vi } from 'vitest';

import {
  applyPlayerGoldState,
  applyPlayerHealState,
  applyPlayerMaxEnergyGrowthState,
  applyPlayerMaxHpGrowthState,
  changePlayerEnergyState,
  clearPlayerStatusState,
  setPlayerEnergyState,
  setPlayerMaxEnergyState,
  setPlayerHpState,
} from '../game/shared/state/player_state_commands.js';
import { enableLegacyPlayerStateCommandFallback } from '../game/platform/legacy/state/legacy_player_state_command_fallback.js';
import { Actions } from '../game/shared/state/public.js';

describe('player_state_commands', () => {
  it('prefers reducer-backed growth actions when dispatch is available', () => {
    const dispatch = vi.fn((action) => {
      if (action === Actions.PLAYER_MAX_HP_GROWTH) return { maxHpAfter: 25, hpAfter: 20 };
      if (action === Actions.PLAYER_MAX_ENERGY_GROWTH) return { maxEnergyAfter: 4, energyAfter: 4 };
      return null;
    });
    const gs = {
      dispatch,
      player: { hp: 15, maxHp: 20, energy: 3, maxEnergy: 3 },
    };

    expect(applyPlayerMaxHpGrowthState(gs, 5)).toEqual({ maxHpAfter: 25, hpAfter: 20 });
    expect(applyPlayerMaxEnergyGrowthState(gs, 1)).toEqual({ maxEnergyAfter: 4, energyAfter: 4 });
    expect(dispatch).toHaveBeenCalledWith(Actions.PLAYER_MAX_HP_GROWTH, { amount: 5 });
    expect(dispatch).toHaveBeenCalledWith(Actions.PLAYER_MAX_ENERGY_GROWTH, { amount: 1 });
  });

  it('prefers reducer-backed player state entrypoints when dispatch is available', () => {
    const dispatch = vi.fn((action) => {
      if (action === Actions.PLAYER_HEAL) return { healed: 4, hpAfter: 14 };
      if (action === Actions.PLAYER_GOLD) return { goldAfter: 9, delta: 2 };
      if (action === Actions.PLAYER_ENERGY_ADJUST) return { energyAfter: 1 };
      if (action === Actions.PLAYER_ENERGY_SET) return { energyAfter: 0 };
      if (action === Actions.PLAYER_HP_SET) return { hpAfter: 8 };
      if (action === Actions.PLAYER_MAX_ENERGY_SET) return { maxEnergyAfter: 2, energyAfter: 1 };
      if (action === Actions.PLAYER_STATUS_CLEAR) return true;
      return null;
    });
    const gs = {
      dispatch,
      player: {
        hp: 10,
        maxHp: 20,
        energy: 2,
        maxEnergy: 3,
        gold: 7,
        statusEffects: { weakened: 2 },
      },
    };

    expect(changePlayerEnergyState(gs, -1)).toEqual({ energyAfter: 1 });
    expect(setPlayerEnergyState(gs, 0)).toEqual({ energyAfter: 0 });
    expect(applyPlayerHealState(gs, 4)).toEqual({ healed: 4, hpAfter: 14 });
    expect(setPlayerHpState(gs, 8)).toEqual({ hpAfter: 8 });
    expect(applyPlayerGoldState(gs, 2)).toEqual({ goldAfter: 9, delta: 2 });
    expect(setPlayerMaxEnergyState(gs, 2)).toEqual({ maxEnergyAfter: 2, energyAfter: 1 });
    expect(clearPlayerStatusState(gs, 'weakened')).toBe(true);

    expect(dispatch).toHaveBeenCalledWith(Actions.PLAYER_ENERGY_ADJUST, { amount: -1 });
    expect(dispatch).toHaveBeenCalledWith(Actions.PLAYER_ENERGY_SET, { amount: 0 });
    expect(dispatch).toHaveBeenCalledWith(Actions.PLAYER_HEAL, { amount: 4 });
    expect(dispatch).toHaveBeenCalledWith(Actions.PLAYER_HP_SET, { amount: 8 });
    expect(dispatch).toHaveBeenCalledWith(Actions.PLAYER_GOLD, { amount: 2 });
    expect(dispatch).toHaveBeenCalledWith(Actions.PLAYER_MAX_ENERGY_SET, { amount: 2, maxEnergyCap: undefined });
    expect(dispatch).toHaveBeenCalledWith(Actions.PLAYER_STATUS_CLEAR, { statusId: 'weakened' });
  });

  it('falls back to local mutation helpers for energy, hp, heal, and status updates', () => {
    const gs = enableLegacyPlayerStateCommandFallback({
      markDirty: vi.fn(),
      player: {
        hp: 10,
        maxHp: 20,
        energy: 2,
        maxEnergy: 3,
        gold: 7,
        statusEffects: { weakened: 2 },
      },
    });

    expect(changePlayerEnergyState(gs, 5)).toEqual({ energyAfter: 3 });
    expect(setPlayerEnergyState(gs, 0)).toEqual({ energyAfter: 0 });
    expect(setPlayerMaxEnergyState(gs, 2)).toEqual({ maxEnergyAfter: 2, energyAfter: 0 });
    expect(applyPlayerHealState(gs, 6)).toEqual({ healed: 6, hpAfter: 16 });
    expect(setPlayerHpState(gs, 99)).toEqual({ hpAfter: 20 });
    expect(applyPlayerGoldState(gs, -2)).toEqual({ goldAfter: 5, delta: -2 });
    expect(clearPlayerStatusState(gs, 'weakened')).toBe(true);

    expect(gs.player.energy).toBe(0);
    expect(gs.player.maxEnergy).toBe(2);
    expect(gs.player.hp).toBe(20);
    expect(gs.player.gold).toBe(5);
    expect(gs.player.statusEffects.weakened).toBe(0);
    expect(gs.markDirty).toHaveBeenCalled();
  });

  it('does not mutate state without dispatch unless compat fallback is explicitly enabled', () => {
    const gs = {
      markDirty: vi.fn(),
      player: {
        hp: 10,
        maxHp: 20,
        energy: 2,
        maxEnergy: 3,
        gold: 7,
        statusEffects: { weakened: 2 },
      },
    };

    expect(changePlayerEnergyState(gs, 1)).toBeNull();
    expect(applyPlayerHealState(gs, 3)).toBeNull();
    expect(clearPlayerStatusState(gs, 'weakened')).toBe(false);
    expect(gs.player.energy).toBe(2);
    expect(gs.player.hp).toBe(10);
    expect(gs.player.statusEffects.weakened).toBe(2);
    expect(gs.markDirty).not.toHaveBeenCalled();
  });
});
