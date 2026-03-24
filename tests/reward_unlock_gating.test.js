import { describe, expect, it, vi } from 'vitest';

import { generateItemShopStock } from '../game/features/event/application/item_shop_actions.js';
import { buildRewardOptionsUseCase } from '../game/features/reward/application/build_reward_options_use_case.js';
import { drawRewardCards } from '../game/features/reward/presentation/browser/reward_screen_runtime_helpers.js';

function withMockedRandom(values, run) {
  const sequence = [...values];
  const spy = vi.spyOn(Math, 'random').mockImplementation(() => sequence.shift() ?? 0);
  try {
    return run();
  } finally {
    spy.mockRestore();
  }
}

describe('reward unlock gating', () => {
  it('excludes locked class-scoped cards from reward card draws', () => {
    const gs = {
      meta: {
        contentUnlocks: {
          curses: {},
          relics: {},
          relicsByClass: {},
          cards: { shared: {} },
        },
      },
      player: {
        class: 'swordsman',
      },
    };
    const data = {
      cards: {
        blade_dance: { id: 'blade_dance', rarity: 'rare' },
        generic_rare: { id: 'generic_rare', rarity: 'rare' },
      },
      upgradeMap: {},
    };

    const rewardCards = withMockedRandom([0], () => drawRewardCards(gs, 1, ['rare'], data));

    expect(rewardCards).toEqual(['generic_rare']);
  });

  it('excludes locked class-scoped relics from reward item choices', () => {
    const gs = {
      meta: {
        contentUnlocks: {
          curses: {},
          relics: {},
          relicsByClass: {},
          cards: { shared: {} },
        },
      },
      player: {
        class: 'mage',
        items: [],
        maxEnergy: 3,
      },
    };
    const data = {
      items: {
        void_compass: { id: 'void_compass', rarity: 'common' },
        shared_relic: { id: 'shared_relic', rarity: 'common' },
      },
      classes: {},
    };

    const rewardOptions = withMockedRandom([0, 0], () => buildRewardOptionsUseCase({
      rewardMode: 'normal',
      isElite: true,
      rewardCards: [],
      data,
      gs,
    }));

    expect(rewardOptions.items.map((item) => item.id)).toEqual(['shared_relic']);
  });

  it('excludes locked class-scoped relics from shop stock generation', () => {
    const gs = {
      meta: {
        runCount: 1,
        contentUnlocks: {
          curses: {},
          relics: {},
          relicsByClass: {},
          cards: { shared: {} },
        },
      },
      currentRegion: 0,
      currentFloor: 1,
      currentNode: { id: 'shop-node' },
      player: {
        class: 'mage',
        items: [],
        gold: 100,
      },
    };
    const data = {
      items: {
        void_compass: { id: 'void_compass', rarity: 'common', obtainableFrom: ['shop'] },
        shared_relic: { id: 'shared_relic', rarity: 'common', obtainableFrom: ['shop'] },
      },
    };
    const runRules = { getShopCost: (_gs, baseCost) => baseCost };

    const stock = withMockedRandom([0], () => generateItemShopStock(gs, data, runRules));

    expect(stock.map((entry) => entry.item.id)).toEqual(['shared_relic']);
  });
});
