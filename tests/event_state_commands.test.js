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
  applyShopEnergyPurchaseState,
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

  it('prefers dispatch-backed gold and energy actions when available', () => {
    const dispatch = vi.fn((action, payload) => {
      if (action === 'player:gold') {
        return { goldAfter: 80 - payload.amount, delta: -payload.amount };
      }
      if (action === 'player:max-energy-growth') {
        return { maxEnergyAfter: 4, energyAfter: 4 };
      }
      return null;
    });
    const onAcquire = vi.fn();
    const state = {
      dispatch,
      player: {
        gold: 100,
        maxEnergy: 3,
        energy: 3,
        items: [],
        deck: ['strike'],
      },
    };

    purchaseEventShopItemState(state, { id: 'relic', onAcquire }, 20);
    applyShopCardPurchaseState(state, 'new_card', 15);
    applyShopCardUpgradeState(state, 'strike', 'strike_plus', 10);
    const result = applyShopEnergyPurchaseState(state, 12, 5);

    expect(dispatch).toHaveBeenCalledWith('player:gold', { amount: -20 });
    expect(dispatch).toHaveBeenCalledWith('player:gold', { amount: -15 });
    expect(dispatch).toHaveBeenCalledWith('player:gold', { amount: -10 });
    expect(dispatch).toHaveBeenCalledWith('player:gold', { amount: -12 });
    expect(dispatch).toHaveBeenCalledWith('player:max-energy-growth', { amount: 1 });
    expect(result).toEqual({ gold: 43, maxEnergy: 4, energy: 4 });
    expect(state.player.items).toContain('relic');
    expect(state.player.deck).toContain('strike_plus');
    expect(state.player.deck).toContain('new_card');
    expect(onAcquire).toHaveBeenCalledWith(state);
  });
});
