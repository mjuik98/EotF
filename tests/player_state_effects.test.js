import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  applyPlayerGoldCompatState: vi.fn(),
  applyPlayerHealCompatState: vi.fn(),
  applyPlayerMaxEnergyGrowthCompatState: vi.fn(),
  applyPlayerMaxHpGrowthCompatState: vi.fn(),
  registerCardDiscovered: vi.fn(),
  registerItemFound: vi.fn(),
}));

vi.mock('../game/shared/state/player_state_command_compat.js', () => ({
  applyPlayerGoldCompatState: hoisted.applyPlayerGoldCompatState,
  applyPlayerHealCompatState: hoisted.applyPlayerHealCompatState,
  applyPlayerMaxEnergyGrowthCompatState: hoisted.applyPlayerMaxEnergyGrowthCompatState,
  applyPlayerMaxHpGrowthCompatState: hoisted.applyPlayerMaxHpGrowthCompatState,
}));

vi.mock('../game/shared/codex/codex_record_state_use_case.js', () => ({
  registerCardDiscovered: hoisted.registerCardDiscovered,
  registerItemFound: hoisted.registerItemFound,
}));

import {
  addPlayerCardAndRegisterState,
  addPlayerItemAndRegisterState,
  applyPlayerGoldDeltaState,
  applyPlayerHealDeltaState,
  applyPlayerMaxEnergyGrowthState,
  replacePlayerDeckCardAndRegisterState,
} from '../game/shared/state/player_state_effects.js';

describe('player_state_effects', () => {
  it('derives gold delta from the observed player state when compat commands mutate state directly', () => {
    hoisted.applyPlayerGoldCompatState.mockImplementation((state, amount) => {
      state.player.gold += amount;
      return null;
    });
    const state = {
      player: {
        gold: 30,
      },
    };

    expect(applyPlayerGoldDeltaState(state, -12)).toEqual({
      delta: -12,
      goldAfter: 18,
    });
  });

  it('uses compat heal and energy growth results when state snapshots do not change inline', () => {
    hoisted.applyPlayerHealCompatState.mockReturnValue({ healed: 6, hpAfter: 28 });
    hoisted.applyPlayerMaxEnergyGrowthCompatState.mockReturnValue({ maxEnergyAfter: 4, energyAfter: 4 });
    const state = {
      player: {
        hp: 20,
        maxHp: 40,
        energy: 3,
        maxEnergy: 3,
      },
    };

    expect(applyPlayerHealDeltaState(state, 6)).toEqual({ healed: 6, hpAfter: 28 });
    expect(applyPlayerMaxEnergyGrowthState(state, 1, { maxEnergyCap: 5 })).toEqual({
      maxEnergyAfter: 4,
      energyAfter: 4,
    });
  });

  it('adds items and cards while registering codex discovery side effects', () => {
    const onAcquire = vi.fn();
    const state = {
      player: {
        deck: ['strike'],
        items: [],
      },
    };

    expect(addPlayerItemAndRegisterState(state, 'starter_relic', { onAcquire })).toBe('starter_relic');
    expect(addPlayerCardAndRegisterState(state, 'guard', { position: 'front' })).toBe('guard');
    expect(replacePlayerDeckCardAndRegisterState(state, 'strike', 'strike_plus')).toBe('strike_plus');

    expect(state.player.items).toEqual(['starter_relic']);
    expect(state.player.deck).toEqual(['guard', 'strike_plus']);
    expect(hoisted.registerItemFound).toHaveBeenCalledWith(state, 'starter_relic');
    expect(hoisted.registerCardDiscovered).toHaveBeenCalledWith(state, 'guard');
    expect(hoisted.registerCardDiscovered).toHaveBeenCalledWith(state, 'strike_plus');
    expect(onAcquire).toHaveBeenCalledWith(state);
  });

  it('applies passive set bonuses immediately when item acquisition completes a set', () => {
    const state = {
      player: {
        items: ['abyssal_eye', 'blood_seal', 'ancient_handle'],
        maxEcho: 50,
        maxHp: 80,
        hp: 45,
      },
      markDirty: vi.fn(),
    };

    addPlayerItemAndRegisterState(state, 'abyssal_hand');
    addPlayerItemAndRegisterState(state, 'blood_oath');
    addPlayerItemAndRegisterState(state, 'ancient_leather');

    expect(state.player.maxEcho).toBe(60);
    expect(state.player.maxHp).toBe(110);
    expect(state.player.hp).toBe(75);
    expect(state._abyssalSet2Applied).toBe(true);
    expect(state._bloodSet2Applied).toBe(true);
    expect(state._ancientSet2Applied).toBe(true);
    expect(state.markDirty).toHaveBeenCalledWith('hud');
  });
});
