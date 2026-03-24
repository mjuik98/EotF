import { describe, expect, it, vi } from 'vitest';
import { EventManager } from '../game/features/event/ports/public_compat_capabilities.js';

function createItemData() {
  return {
    items: {
      c1: { id: 'c1', rarity: 'common', name: 'c1' },
      c2: { id: 'c2', rarity: 'common', name: 'c2' },
      u1: { id: 'u1', rarity: 'uncommon', name: 'u1' },
      u2: { id: 'u2', rarity: 'uncommon', name: 'u2' },
      r1: { id: 'r1', rarity: 'rare', name: 'r1' },
      r2: { id: 'r2', rarity: 'rare', name: 'r2' },
      l1: { id: 'l1', rarity: 'legendary', name: 'l1' },
      l2: { id: 'l2', rarity: 'legendary', name: 'l2' },
    },
  };
}

function createState() {
  return {
    meta: { runCount: 1 },
    currentRegion: 0,
    currentFloor: 3,
    currentNode: { id: '3-2' },
    player: { items: [], gold: 999 },
  };
}

describe('EventManager item shop stock cache', () => {
  it('returns cached stock when reopening the same shop session', () => {
    const gs = createState();
    const data = createItemData();
    const runRules = { getShopCost: (_gs, baseCost) => baseCost };
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.0);

    const first = EventManager.generateItemShopStock(gs, data, runRules);
    const firstIds = first.map((entry) => entry.item.id);

    randomSpy.mockReturnValue(0.999);
    const reopened = EventManager.generateItemShopStock(gs, data, runRules);
    const reopenedIds = reopened.map((entry) => entry.item.id);

    expect(reopened).toBe(first);
    expect(reopenedIds).toEqual(firstIds);
    randomSpy.mockRestore();
  });

  it('refreshes stock when entering a different shop node/session', () => {
    const gs = createState();
    const data = createItemData();
    const runRules = { getShopCost: (_gs, baseCost) => baseCost };
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.0);

    const first = EventManager.generateItemShopStock(gs, data, runRules);
    const firstIds = first.map((entry) => entry.item.id);

    gs.currentNode = { id: '3-4' };
    randomSpy.mockReturnValue(0.999);
    const second = EventManager.generateItemShopStock(gs, data, runRules);
    const secondIds = second.map((entry) => entry.item.id);

    expect(second).not.toBe(first);
    expect(secondIds).not.toEqual(firstIds);
    randomSpy.mockRestore();
  });

  it('does not include max-energy purchase in shop choices', () => {
    const gs = {
      player: { gold: 200, energy: 3, maxEnergy: 3 },
      worldMemory: {},
    };
    const data = {};
    const runRules = { getShopCost: (_gs, baseCost) => baseCost };
    const shopEvent = EventManager.createShopEvent(gs, data, runRules);

    const energyChoice = shopEvent.choices.find((choice) => choice.cssClass === 'shop-choice-energy');
    expect(energyChoice).toBeUndefined();
    expect(shopEvent.choices).toHaveLength(5);
  });
});
