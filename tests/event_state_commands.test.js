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
  applyShopCardPurchaseState,
  applyShopCardUpgradeState,
  discardEventCardState,
  purchaseEventShopItemState,
  readItemShopStockCache,
  restoreStagnationDeckState,
  writeItemShopStockCache,
} from '../game/features/event/state/event_state_commands.js';

describe('event_state_commands', () => {
  it('reads and writes item shop cache through a single state boundary', () => {
    const state = {};
    const stock = [{ item: { id: 'rare' }, cost: 30 }];

    writeItemShopStockCache(state, '1:0:3:shop', stock);

    expect(readItemShopStockCache(state, '1:0:3:shop')).toBe(stock);
    expect(readItemShopStockCache(state, 'miss')).toBeNull();
  });

  it('applies shop purchase, upgrade, discard, and restoration state changes', () => {
    const onAcquire = vi.fn();
    const state = {
      _stagnationVault: ['burned_card'],
      player: {
        gold: 100,
        items: [],
        deck: ['strike'],
        hand: ['guard'],
        graveyard: [],
      },
    };

    purchaseEventShopItemState(state, { id: 'relic', onAcquire }, 20);
    applyShopCardPurchaseState(state, 'new_card', 10);
    applyShopCardUpgradeState(state, 'strike', 'strike_plus', 15);
    const discarded = discardEventCardState(state, 'guard');
    const restored = restoreStagnationDeckState(state);

    expect(discarded).toBe(true);
    expect(restored).toEqual(['burned_card']);
    expect(state.player.gold).toBe(55);
    expect(state.player.items).toContain('relic');
    expect(state.player.deck).toEqual(expect.arrayContaining(['strike_plus', 'new_card', 'burned_card']));
    expect(onAcquire).toHaveBeenCalledWith(state);
  });
});
