import { describe, expect, it, vi } from 'vitest';

import { purchaseEventShopItemState } from '../game/features/event/state/event_state_commands.js';
import {
  addRewardItemToInventory,
  applyMiniBossBonusState,
} from '../game/features/reward/state/reward_state_commands.js';
import { applyRunStartLoadout } from '../game/shared/state/run_state_commands.js';
import { ITEMS } from '../data/items.js';

function createAcquireRelic(label, onAcquireSpy) {
  return {
    id: label,
    onAcquire: onAcquireSpy,
  };
}

describe('item acquire paths', () => {
  it('runs onAcquire across starting loadout, event shop, reward inventory, and mini-boss reward paths', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const startAcquire = vi.fn((state) => {
      state.player.maxHp += 5;
      state.player.hp += 5;
    });
    const eventAcquire = vi.fn((state) => {
      state.player.maxHp += 3;
      state.player.hp += 3;
    });
    const rewardAcquire = vi.fn((state) => {
      state.player.maxEnergy += 1;
    });
    const miniBossAcquire = vi.fn((state) => {
      state.player.maxEnergy += 2;
    });

    const runState = {
      meta: { codex: { enemies: new Set(), cards: new Set(), items: new Set() } },
    };
    applyRunStartLoadout(runState, 'swordsman', {
      stats: { HP: 40 },
      startRelic: 'starter',
    }, {
      startDecks: {
        swordsman: ['strike'],
      },
      items: {
        starter: createAcquireRelic('starter', startAcquire),
      },
    });

    const eventState = {
      player: {
        gold: 50,
        maxHp: 20,
        hp: 12,
        items: [],
      },
    };
    purchaseEventShopItemState(eventState, createAcquireRelic('event_relic', eventAcquire), 20);

    const rewardState = {
      player: {
        items: [],
        maxEnergy: 3,
      },
    };
    addRewardItemToInventory(rewardState, 'reward_relic', createAcquireRelic('reward_relic', rewardAcquire));

    const miniBossState = {
      currentRegion: 1,
      player: {
        hp: 24,
        maxHp: 40,
        gold: 10,
        items: [],
        maxEnergy: 3,
      },
    };
    applyMiniBossBonusState(miniBossState, {
      items: {
        mini_boss_relic: {
          ...createAcquireRelic('mini_boss_relic', miniBossAcquire),
          rarity: 'rare',
        },
      },
    });

    expect(startAcquire).toHaveBeenCalledWith(runState);
    expect(runState.player.items).toContain('starter');
    expect(runState.player.maxHp).toBe(45);
    expect(runState.player.hp).toBe(45);

    expect(eventAcquire).toHaveBeenCalledWith(eventState);
    expect(eventState.player.items).toContain('event_relic');
    expect(eventState.player.gold).toBe(30);
    expect(eventState.player.maxHp).toBe(23);
    expect(eventState.player.hp).toBe(15);

    expect(rewardAcquire).toHaveBeenCalledWith(rewardState);
    expect(rewardState.player.items).toContain('reward_relic');
    expect(rewardState.player.maxEnergy).toBe(4);

    expect(miniBossAcquire).toHaveBeenCalledWith(miniBossState);
    expect(miniBossState.player.items).toContain('mini_boss_relic');
    expect(miniBossState.player.maxEnergy).toBe(5);
  });

  it('does not heal when acquiring relics whose descriptions only promise max-hp growth', () => {
    const cases = [
      ['ancient_handle', 5],
      ['ancient_leather', 5],
      ['ancient_belt', 5],
      ['ancient_cape', 5],
      ['titan_heart', 50],
      ['eternal_fragment', 20],
      ['memory_thread', 12],
      ['curator_lantern', 8],
      ['specimen_case', 10],
    ];

    cases.forEach(([itemId, maxHpGain]) => {
      const state = {
        player: {
          items: [],
          hp: 11,
          maxHp: 30,
        },
      };

      addRewardItemToInventory(state, itemId, ITEMS[itemId]);

      expect(state.player.items).toContain(itemId);
      expect(state.player.maxHp).toBe(30 + maxHpGain);
      expect(state.player.hp).toBe(11);
    });
  });
});
