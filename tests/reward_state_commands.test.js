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

  it('routes mini-boss heal and gold through shared player state commands when dispatch is available', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const dispatch = vi.fn((action, payload) => {
      if (action === Actions.PLAYER_HEAL) {
        return { healed: payload.amount, hpAfter: 28 };
      }
      if (action === Actions.PLAYER_GOLD) {
        return { delta: payload.amount, goldAfter: 23 };
      }
      return null;
    });
    const state = {
      currentRegion: 2,
      dispatch,
      player: {
        hp: 20,
        maxHp: 40,
        gold: 5,
        items: [],
      },
    };
    const data = {
      items: {
        rare: { id: 'rare', rarity: 'rare' },
      },
    };

    const result = applyMiniBossBonusState(state, data);

    expect(result).toEqual(expect.objectContaining({
      goldGain: 18,
      healed: 6,
    }));
    expect(dispatch).toHaveBeenCalledWith(Actions.PLAYER_HEAL, { amount: 6 });
    expect(dispatch).toHaveBeenCalledWith(Actions.PLAYER_GOLD, { amount: 18 });
    vi.restoreAllMocks();
  });

  it('applies onAcquire effects for guaranteed mini-boss relic rewards', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const onAcquire = vi.fn((state) => {
      state.player.maxEnergy += 1;
    });
    const state = {
      currentRegion: 2,
      player: {
        hp: 20,
        maxHp: 40,
        gold: 5,
        items: [],
        maxEnergy: 3,
      },
    };
    const data = {
      items: {
        rare: { id: 'rare', rarity: 'rare', onAcquire },
      },
    };

    const result = applyMiniBossBonusState(state, data);

    expect(result?.guaranteed?.id).toBe('rare');
    expect(state.player.items).toContain('rare');
    expect(onAcquire).toHaveBeenCalledWith(state);
    expect(state.player.maxEnergy).toBe(4);
    vi.restoreAllMocks();
  });
});
