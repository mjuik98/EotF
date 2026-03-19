import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  registerCardDiscovered: vi.fn(),
  registerItemFound: vi.fn(),
}));

vi.mock('../game/shared/codex/codex_record_state_use_case.js', () => ({
  registerCardDiscovered: hoisted.registerCardDiscovered,
  registerItemFound: hoisted.registerItemFound,
}));

import {
  addRewardItemToInventory,
  applyBlessingRewardState,
  applyMiniBossBonusState,
  upgradeRandomRewardCardState,
} from '../game/features/reward/state/reward_state_commands.js';
import { Actions } from '../game/core/store/state_actions.js';

describe('reward_state_commands', () => {
  it('applies mini-boss hp, gold, and guaranteed rare item state in one command', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const state = {
      currentRegion: 2,
      player: {
        hp: 20,
        maxHp: 40,
        gold: 5,
        items: [],
      },
    };
    const data = {
      items: {
        common: { id: 'common', rarity: 'common' },
        rare: { id: 'rare', rarity: 'rare' },
      },
    };

    const result = applyMiniBossBonusState(state, data);

    expect(result).toEqual(expect.objectContaining({
      goldGain: 18,
      healed: 6,
      guaranteed: expect.objectContaining({ id: 'rare' }),
    }));
    expect(state.player.hp).toBe(26);
    expect(state.player.gold).toBe(23);
    expect(state.player.items).toContain('rare');
    expect(hoisted.registerItemFound).toHaveBeenCalledWith(state, 'rare');
    vi.restoreAllMocks();
  });

  it('adds inventory items and upgrades deck cards through state commands', () => {
    const onAcquire = vi.fn();
    const state = {
      player: {
        deck: ['strike'],
        items: [],
      },
    };

    addRewardItemToInventory(state, 'charm', { id: 'charm', onAcquire });
    const upgradedId = upgradeRandomRewardCardState(state, {
      upgradeMap: {
        strike: 'strike_plus',
      },
    });

    expect(upgradedId).toBe('strike_plus');
    expect(state.player.items).toContain('charm');
    expect(state.player.deck).toContain('strike_plus');
    expect(onAcquire).toHaveBeenCalledWith(state);
  });

  it('prefers reducer-driven player growth actions when dispatch is available', () => {
    const dispatch = vi.fn((action, payload) => {
      if (action === Actions.PLAYER_MAX_HP_GROWTH) {
        return { maxHpAfter: 35, hpAfter: 25 };
      }
      if (action === Actions.PLAYER_MAX_ENERGY_GROWTH) {
        return { maxEnergyAfter: 4, energyAfter: 4 };
      }
      return null;
    });
    const state = {
      dispatch,
      player: {
        hp: 20,
        maxHp: 30,
        energy: 3,
        maxEnergy: 3,
      },
    };

    expect(applyBlessingRewardState(state, { type: 'hp', amount: 5 })).toBe(true);
    expect(applyBlessingRewardState(state, { type: 'energy', amount: 1 })).toBe(true);

    expect(dispatch).toHaveBeenCalledWith(Actions.PLAYER_MAX_HP_GROWTH, { amount: 5 });
    expect(dispatch).toHaveBeenCalledWith(Actions.PLAYER_MAX_ENERGY_GROWTH, { amount: 1 });
  });
});
