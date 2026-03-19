import { describe, expect, it, vi } from 'vitest';

import {
  applyPlayerGoldState,
  applyPlayerHealState,
  applyPlayerMaxEnergyGrowthState,
  applyPlayerMaxHpGrowthState,
  adjustPlayerSilenceGaugeState,
  adjustPlayerTimeRiftGaugeState,
  changePlayerEnergyState,
  clearPlayerStatusState,
  setPlayerEchoState,
  setPlayerEnergyState,
  setPlayerMaxEnergyState,
  setPlayerHpState,
} from '../game/shared/state/player_state_commands.js';
import { enableLegacyPlayerStateCommandFallback } from '../game/platform/legacy/state/legacy_player_state_command_fallback.js';
import { Actions } from '../game/core/store/state_actions.js';

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
      if (action === Actions.PLAYER_ECHO) return { echoAfter: 5 };
      if (action === Actions.PLAYER_HP_SET) return { hpAfter: 8 };
      if (action === Actions.PLAYER_MAX_ENERGY_SET) return { maxEnergyAfter: 2, energyAfter: 1 };
      if (action === Actions.PLAYER_SILENCE) return { silenceGauge: 1 };
      if (action === Actions.PLAYER_STATUS_CLEAR) return true;
      if (action === Actions.PLAYER_TIME_RIFT) return { timeRiftGauge: 0 };
      return null;
    });
    const gs = {
      dispatch,
      player: {
        echo: 2,
        maxEcho: 10,
        hp: 10,
        maxHp: 20,
        energy: 2,
        maxEnergy: 3,
        gold: 7,
        silenceGauge: 3,
        statusEffects: { weakened: 2 },
        timeRiftGauge: 2,
      },
    };

    expect(changePlayerEnergyState(gs, -1)).toEqual({ energyAfter: 1 });
    expect(setPlayerEnergyState(gs, 0)).toEqual({ energyAfter: 0 });
    expect(setPlayerEchoState(gs, 5)).toEqual({ echoAfter: 5 });
    expect(applyPlayerHealState(gs, 4)).toEqual({ healed: 4, hpAfter: 14 });
    expect(setPlayerHpState(gs, 8)).toEqual({ hpAfter: 8 });
    expect(applyPlayerGoldState(gs, 2)).toEqual({ goldAfter: 9, delta: 2 });
    expect(setPlayerMaxEnergyState(gs, 2)).toEqual({ maxEnergyAfter: 2, energyAfter: 1 });
    expect(adjustPlayerSilenceGaugeState(gs, -2)).toEqual({ silenceGauge: 1 });
    expect(adjustPlayerTimeRiftGaugeState(gs, -2)).toEqual({ timeRiftGauge: 0 });
    expect(clearPlayerStatusState(gs, 'weakened')).toBe(true);

    expect(dispatch).toHaveBeenCalledWith(Actions.PLAYER_ENERGY_ADJUST, { amount: -1 });
    expect(dispatch).toHaveBeenCalledWith(Actions.PLAYER_ENERGY_SET, { amount: 0 });
    expect(dispatch).toHaveBeenCalledWith(Actions.PLAYER_ECHO, { amount: 3 });
    expect(dispatch).toHaveBeenCalledWith(Actions.PLAYER_HEAL, { amount: 4 });
    expect(dispatch).toHaveBeenCalledWith(Actions.PLAYER_HP_SET, { amount: 8 });
    expect(dispatch).toHaveBeenCalledWith(Actions.PLAYER_GOLD, { amount: 2 });
    expect(dispatch).toHaveBeenCalledWith(Actions.PLAYER_MAX_ENERGY_SET, { amount: 2, maxEnergyCap: undefined });
    expect(dispatch).toHaveBeenCalledWith(Actions.PLAYER_SILENCE, { amount: -2 });
    expect(dispatch).toHaveBeenCalledWith(Actions.PLAYER_STATUS_CLEAR, { statusId: 'weakened' });
    expect(dispatch).toHaveBeenCalledWith(Actions.PLAYER_TIME_RIFT, { amount: -2 });
  });

  it('falls back to local mutation helpers for energy, hp, heal, and status updates', () => {
    const gs = enableLegacyPlayerStateCommandFallback({
      markDirty: vi.fn(),
      player: {
        echo: 2,
        maxEcho: 10,
        hp: 10,
        maxHp: 20,
        energy: 2,
        maxEnergy: 3,
        gold: 7,
        silenceGauge: 3,
        statusEffects: { weakened: 2 },
        timeRiftGauge: 2,
      },
    });

    expect(changePlayerEnergyState(gs, 5)).toEqual({ energyAfter: 3 });
    expect(setPlayerEnergyState(gs, 0)).toEqual({ energyAfter: 0 });
    expect(setPlayerEchoState(gs, 99)).toEqual({ echoAfter: 10 });
    expect(setPlayerMaxEnergyState(gs, 2)).toEqual({ maxEnergyAfter: 2, energyAfter: 0 });
    expect(applyPlayerHealState(gs, 6)).toEqual({ healed: 6, hpAfter: 16 });
    expect(setPlayerHpState(gs, 99)).toEqual({ hpAfter: 20 });
    expect(applyPlayerGoldState(gs, -2)).toEqual({ goldAfter: 5, delta: -2 });
    expect(adjustPlayerSilenceGaugeState(gs, -10)).toEqual({ silenceGauge: 0 });
    expect(adjustPlayerTimeRiftGaugeState(gs, -10)).toEqual({ timeRiftGauge: 0 });
    expect(clearPlayerStatusState(gs, 'weakened')).toBe(true);

    expect(gs.player.echo).toBe(10);
    expect(gs.player.energy).toBe(0);
    expect(gs.player.maxEnergy).toBe(2);
    expect(gs.player.hp).toBe(20);
    expect(gs.player.gold).toBe(5);
    expect(gs.player.silenceGauge).toBe(0);
    expect(gs.player.statusEffects.weakened).toBe(0);
    expect(gs.player.timeRiftGauge).toBe(0);
    expect(gs.markDirty).toHaveBeenCalled();
  });

  it('does not mutate state without dispatch unless compat fallback is explicitly enabled', () => {
    const gs = {
      markDirty: vi.fn(),
      player: {
        echo: 2,
        maxEcho: 10,
        hp: 10,
        maxHp: 20,
        energy: 2,
        maxEnergy: 3,
        gold: 7,
        silenceGauge: 3,
        statusEffects: { weakened: 2 },
        timeRiftGauge: 2,
      },
    };

    expect(changePlayerEnergyState(gs, 1)).toBeNull();
    expect(setPlayerEchoState(gs, 3)).toBeNull();
    expect(applyPlayerHealState(gs, 3)).toBeNull();
    expect(adjustPlayerSilenceGaugeState(gs, -1)).toBeNull();
    expect(adjustPlayerTimeRiftGaugeState(gs, -1)).toBeNull();
    expect(clearPlayerStatusState(gs, 'weakened')).toBe(false);
    expect(gs.player.echo).toBe(2);
    expect(gs.player.energy).toBe(2);
    expect(gs.player.hp).toBe(10);
    expect(gs.player.silenceGauge).toBe(3);
    expect(gs.player.statusEffects.weakened).toBe(2);
    expect(gs.player.timeRiftGauge).toBe(2);
    expect(gs.markDirty).not.toHaveBeenCalled();
  });
});
