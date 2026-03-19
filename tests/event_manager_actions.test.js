import { describe, expect, it, vi } from 'vitest';

const {
  pickRandomEventSpy,
  resolveEventChoiceSpy,
  createShopEventSpy,
  createRestEventSpy,
  generateItemShopStockSpy,
  purchaseItemSpy,
  discardEventCardSpy,
} = vi.hoisted(() => ({
  pickRandomEventSpy: vi.fn(() => ({ id: 'picked' })),
  resolveEventChoiceSpy: vi.fn(() => ({ resultText: 'resolved' })),
  createShopEventSpy: vi.fn(() => ({ id: 'shop' })),
  createRestEventSpy: vi.fn(() => ({ id: 'rest' })),
  generateItemShopStockSpy: vi.fn(() => [{ item: { id: 'probe' }, cost: 10 }]),
  purchaseItemSpy: vi.fn(() => ({ success: true })),
  discardEventCardSpy: vi.fn(() => ({ success: false, message: 'missing' })),
}));

vi.mock('../game/features/event/application/resolve_event_choice_actions.js', () => ({
  pickRandomEvent: pickRandomEventSpy,
  resolveEventChoice: resolveEventChoiceSpy,
}));

vi.mock('../game/features/event/application/event_shop_actions.js', () => ({
  createShopEvent: createShopEventSpy,
  createRestEvent: createRestEventSpy,
}));

vi.mock('../game/features/event/application/item_shop_actions.js', () => ({
  generateItemShopStock: generateItemShopStockSpy,
  purchaseItem: purchaseItemSpy,
  discardEventCard: discardEventCardSpy,
}));

import {
  buildItemShopStockAction,
  createRestEventAction,
  createShopEventAction,
  discardEventCardAction,
  pickRandomEventAction,
  purchaseItemFromShopAction,
  resolveEventChoiceAction,
} from '../game/features/event/app/event_manager_actions.js';

describe('event_manager_actions', () => {
  it('delegates event actions to feature-local helpers', () => {
    const gs = {
      player: {
        gold: 0,
        hp: 10,
        maxHp: 10,
        deck: [],
        hand: [],
        graveyard: [],
        items: [],
      },
      currentFloor: 1,
      currentRegion: 0,
      meta: { runCount: 1 },
      currentNode: { id: 'test' },
      worldMemory: {},
    };
    const data = {
      events: [{ id: 'merchant', choices: [{ effect: () => 'ok' }] }],
      cards: {},
      items: {},
    };
    const runRules = {
      getShopCost: (_state, baseCost) => baseCost,
      getHealAmount: (_state, amount) => amount,
    };

    expect(pickRandomEventAction(gs, data)).toEqual({ id: 'picked' });
    expect(resolveEventChoiceAction(gs, data.events[0], 0)).toEqual({ resultText: 'resolved' });
    expect(createShopEventAction(gs, data, runRules)).toEqual({ id: 'shop' });
    expect(createRestEventAction(gs, data, runRules)).toEqual({ id: 'rest' });
    expect(buildItemShopStockAction(gs, data, runRules)).toEqual([{ item: { id: 'probe' }, cost: 10 }]);
    expect(purchaseItemFromShopAction(gs, { id: 'probe', name: 'Probe' }, 1)).toEqual({ success: true });
    expect(discardEventCardAction(gs, 'missing', data, false)).toEqual({ success: false, message: 'missing' });

    expect(pickRandomEventSpy).toHaveBeenCalledWith(gs, data);
    expect(resolveEventChoiceSpy).toHaveBeenCalledWith(gs, data.events[0], 0);
    expect(createShopEventSpy).toHaveBeenCalledWith(gs, data, runRules, {});
    expect(createRestEventSpy).toHaveBeenCalledWith(gs, data, runRules, {});
    expect(generateItemShopStockSpy).toHaveBeenCalledWith(gs, data, runRules);
    expect(purchaseItemSpy).toHaveBeenCalledWith(gs, { id: 'probe', name: 'Probe' }, 1);
    expect(discardEventCardSpy).toHaveBeenCalledWith(gs, 'missing', data, false);
  });
});
