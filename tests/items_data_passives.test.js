import { describe, expect, it, vi } from 'vitest';

import { ITEMS } from '../data/items.js';
import { Actions } from '../game/core/store/state_actions.js';
import { ItemSystem } from '../game/shared/progression/item_system.js';
import { Trigger } from '../game/data/triggers.js';

describe('items data passives', () => {
  it('restores the first exhausted card through liquid_memory and resets on combat start', () => {
    const gs = {
      _liquidMemoryUsed: false,
      player: {
        deck: ['guard'],
        exhausted: ['strike'],
      },
      addLog: vi.fn(),
    };

    ITEMS.liquid_memory.passive(gs, Trigger.CARD_EXHAUST, { cardId: 'strike' });

    expect(gs._liquidMemoryUsed).toBe(true);
    expect(gs.player.exhausted).toEqual([]);
    expect(gs.player.deck).toEqual(['guard', 'strike']);

    ITEMS.liquid_memory.passive(gs, Trigger.COMBAT_START);

    expect(gs._liquidMemoryUsed).toBe(false);
  });

  it('adds one draw on the next turn through balanced_scale and clears it on end-of-turn cleanup', () => {
    const gs = {
      player: {
        energy: 0,
        drawCount: 1,
      },
      addLog: vi.fn(),
    };

    ITEMS.balanced_scale.passive(gs, Trigger.TURN_END);
    ITEMS.balanced_scale.passive(gs, Trigger.TURN_START);

    expect(gs.player.drawCount).toBe(2);
    expect(gs._scaleActive).toBe(false);
    expect(gs._scaleDrawReset).toBe(true);

    ITEMS.balanced_scale.passive(gs, Trigger.TURN_END);

    expect(gs.player.drawCount).toBe(1);
    expect(gs._scaleDrawReset).toBe(false);
  });

  it('adds and removes a temporary card through ancient_scroll combat lifecycle', () => {
    const gs = {
      player: {
        hand: [],
        deck: [],
        graveyard: [],
        exhausted: [],
      },
      addLog: vi.fn(),
    };

    vi.spyOn(Math, 'random').mockReturnValue(0);

    ITEMS.ancient_scroll.passive(gs, Trigger.COMBAT_START);

    const tempCardId = gs._scrollTempCard;
    expect(typeof tempCardId).toBe('string');
    expect(gs.player.hand).toContain(tempCardId);

    gs.player.deck.push(tempCardId);
    gs.player.graveyard.push(tempCardId);
    gs.player.exhausted.push(tempCardId);

    ITEMS.ancient_scroll.passive(gs, Trigger.COMBAT_END);

    expect(gs._scrollTempCard).toBeNull();
    expect(gs.player.hand).not.toContain(tempCardId);
    expect(gs.player.deck).not.toContain(tempCardId);
    expect(gs.player.graveyard).not.toContain(tempCardId);
    expect(gs.player.exhausted).not.toContain(tempCardId);
  });

  it('caps energy_core growth after two boss combat victories', () => {
    const gs = {
      player: {
        maxEnergy: 3,
        energy: 2,
        _energyCoreCount: 0,
      },
      markDirty: vi.fn(),
      addLog: vi.fn(),
    };

    ITEMS.energy_core.passive(gs, Trigger.COMBAT_END, { isBoss: true });
    ITEMS.energy_core.passive(gs, Trigger.COMBAT_END, { isBoss: true });
    ITEMS.energy_core.passive(gs, Trigger.COMBAT_END, { isBoss: true });

    expect(gs.player._energyCoreCount).toBe(2);
    expect(gs.player.maxEnergy).toBe(5);
    expect(gs.player.energy).toBe(4);
    expect(gs.markDirty).toHaveBeenCalledTimes(2);
  });

  it('boosts special reward card choices through dimension_key', () => {
    expect(
      ITEMS.dimension_key.passive({}, Trigger.REWARD_GENERATE, { type: 'card', count: 3 }),
    ).toBe(4);
    expect(
      ITEMS.dimension_key.passive({}, Trigger.REWARD_GENERATE, { type: 'item', count: 3 }),
    ).toBeUndefined();
  });

  it('routes combat-start draw passives through runtime compat without mutating canonical GS helpers', () => {
    const gs = {
      combat: { active: true },
      dispatch: vi.fn(),
      player: {
        hp: 20,
        items: ['bloody_contract'],
      },
      addLog: vi.fn(),
    };

    expect(gs.drawCards).toBeUndefined();

    expect(() => ItemSystem.triggerItems(gs, Trigger.COMBAT_START)).not.toThrow();

    expect(gs.player.hp).toBe(14);
    expect(gs.dispatch).toHaveBeenCalledWith(Actions.CARD_DRAW, { count: 2 });
    expect(gs.drawCards).toBeUndefined();
  });
});
