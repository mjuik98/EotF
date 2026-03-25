import { describe, expect, it, vi } from 'vitest';

import { ITEMS } from '../data/items.js';
import { Actions, Reducers } from '../game/core/store/state_actions.js';
import {
  restUpgradeCard,
  shopBuyPotion,
} from '../game/features/event/application/event_shop_actions.js';
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

  it('returns the first exhausted card to the combat draw pile instead of mutating the permanent deck', () => {
    const gs = {
      player: {
        items: ['liquid_memory'],
        hand: ['strike'],
        deck: ['guard'],
        drawPile: ['defend'],
        graveyard: [],
        exhausted: [],
      },
      markDirty: vi.fn(),
      addLog: vi.fn(),
      triggerItems(trigger, data) {
        return ItemSystem.triggerItems(this, trigger, data);
      },
    };

    Reducers[Actions.CARD_DISCARD](gs, { cardId: 'strike', exhaust: true });

    expect(gs.player.drawPile).toEqual(['defend', 'strike']);
    expect(gs.player.deck).toEqual(['guard']);
    expect(gs.player.exhausted).toEqual([]);
  });

  it('adds one draw on the next turn through balanced_scale and clears it on end-of-turn cleanup', () => {
    const gs = {
      player: {
        energy: 0,
        drawCount: 0,
      },
      addLog: vi.fn(),
    };

    ITEMS.balanced_scale.passive(gs, Trigger.TURN_END);
    ITEMS.balanced_scale.passive(gs, Trigger.TURN_START);

    expect(gs.player.drawCount).toBe(1);
    expect(gs._scaleActive).toBe(false);
    expect(gs._scaleDrawReset).toBe(true);

    ITEMS.balanced_scale.passive(gs, Trigger.TURN_END);

    expect(gs.player.drawCount).toBe(0);
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

  it('adds dimension_pocket noise into the combat draw pile without polluting the permanent deck', () => {
    const gs = {
      player: {
        items: ['dimension_pocket'],
        deck: ['strike', 'guard'],
        drawPile: ['strike', 'guard'],
      },
      addLog: vi.fn(),
    };

    ItemSystem.triggerItems(gs, Trigger.TURN_START);

    expect(gs.player.drawPile).toContain('curse_noise');
    expect(gs.player.deck).toEqual(['strike', 'guard']);
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

  it('routes infinite_loop through the actual exhaust pipeline before cloning the card', () => {
    const gs = {
      _loopCount: 2,
      player: {
        items: ['infinite_loop'],
        hand: ['strike'],
        graveyard: [],
        exhausted: [],
      },
      dispatch(action, payload) {
        return Reducers[action](this, payload);
      },
      triggerItems: vi.fn(),
      markDirty: vi.fn(),
      addLog: vi.fn(),
    };
    gs.triggerItems.mockImplementation((trigger, data) => ItemSystem.triggerItems(gs, trigger, data));

    ItemSystem.triggerItems(gs, Trigger.CARD_PLAY, { cardId: 'guard', cost: 1 });

    expect(gs.player.hand).toEqual(['strike', 'strike']);
    expect(gs.player.exhausted).toEqual(['strike']);
    expect(gs.triggerItems).toHaveBeenCalledWith('card_exhaust', { cardId: 'strike' });
  });

  it('triggers heavy_anvil during rest upgrades to upgrade an additional random card', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    const gs = {
      player: {
        deck: ['strike', 'defend'],
        items: ['heavy_anvil'],
      },
      addLog: vi.fn(),
      triggerItems(trigger, data) {
        return ItemSystem.triggerItems(this, trigger, data);
      },
    };

    const result = restUpgradeCard(gs, {
      upgradeMap: {
        strike: 'strike_plus',
        defend: 'defend_plus',
      },
      cards: {
        strike: { name: '타격' },
        defend: { name: '수비' },
      },
    });

    expect(result).toBe('타격 강화 완료.');
    expect(gs.player.deck).toEqual(['strike_plus', 'defend_plus']);
    expect(gs.addLog).toHaveBeenCalledWith('✨ 타격 강화', 'echo');
    expect(gs.addLog).toHaveBeenCalledWith(expect.stringContaining('무거운 모루'), 'item');

    randomSpy.mockRestore();
  });

  it('returns a before_card_cost delta through crystal_ball instead of an absolute cost', () => {
    const gs = {
      _crystalDiscounted: new Set(['strike']),
      player: {
        items: ['crystal_ball'],
      },
    };

    expect(ItemSystem.triggerItems(gs, Trigger.BEFORE_CARD_COST, {
      cardId: 'strike',
      cost: 2,
      baseCost: 2,
    })).toBe(-1);
  });

  it('blocks healing through titan_heart using the heal_amount trigger', () => {
    const gs = {
      player: {
        items: ['titan_heart'],
      },
    };

    expect(ItemSystem.triggerItems(gs, Trigger.HEAL_AMOUNT, 8)).toBe(0);
  });

  it('applies eye_of_storm vulnerable to every enemy instead of the player', () => {
    const gs = {
      player: {
        items: ['eye_of_storm'],
      },
      combat: {
        enemies: [
          { hp: 10, statusEffects: {} },
          { hp: 12, statusEffects: {} },
        ],
      },
      dispatch: vi.fn((action, payload) => {
        if (action !== Actions.ENEMY_STATUS) return null;
        const enemy = gs.combat.enemies[payload.targetIdx];
        enemy.statusEffects[payload.status] = (enemy.statusEffects[payload.status] || 0) + payload.duration;
        return { status: payload.status, duration: enemy.statusEffects[payload.status], targetIdx: payload.targetIdx };
      }),
      addLog: vi.fn(),
    };

    ItemSystem.triggerItems(gs, Trigger.TURN_START);

    expect(gs.combat.enemies[0].statusEffects.vulnerable).toBe(1);
    expect(gs.combat.enemies[1].statusEffects.vulnerable).toBe(1);
  });

  it('preserves object payload overrides from item passives', () => {
    const gs = {
      player: {
        items: ['abyssal_hand', 'ancient_battery'],
      },
    };

    expect(ItemSystem.triggerItems(gs, Trigger.CARD_PLAY, { cardId: 'strike', cost: 1 })).toEqual({
      cardId: 'strike',
      cost: 1,
      doubleCast: true,
    });
    expect(ItemSystem.triggerItems(gs, Trigger.ITEM_USE, { itemId: 'potion', cost: 1 })).toEqual({
      itemId: 'potion',
      cost: 1,
      costFree: true,
    });
  });

  it('boosts damage against elite and boss enemies through the active deal_damage hook', () => {
    const gs = {
      player: {
        items: ['god_slayer_blade'],
      },
      combat: {
        enemies: [{ hp: 30, isElite: true }],
      },
    };

    expect(ItemSystem.triggerItems(gs, Trigger.DEAL_DAMAGE, 10)).toBe(15);
  });

  it('waives the first potion purchase cost through ancient_battery item_use wiring', () => {
    const gs = {
      player: {
        gold: 50,
        items: ['ancient_battery'],
      },
      heal: vi.fn(),
      triggerItems(trigger, data) {
        return ItemSystem.triggerItems(this, trigger, data);
      },
    };

    const result = shopBuyPotion(gs, 25);

    expect(result).toBe('❤️ 체력 30 회복. 남은 골드: 50');
    expect(gs.player.gold).toBe(50);
    expect(gs.heal).toHaveBeenCalledWith(30);
  });

  it('grants a consumable dodge stack through golden_feather on combat start', () => {
    const gs = {
      player: {
        items: ['golden_feather'],
        buffs: {},
      },
      addBuff(id, stacks, data = {}) {
        gs.player.buffs[id] = { stacks, ...data };
        return gs.player.buffs[id];
      },
    };

    ItemSystem.triggerItems(gs, Trigger.COMBAT_START);

    expect(gs.player.buffs.dodge).toEqual(expect.objectContaining({ stacks: 1 }));
  });

  it('applies boss_soul_mirror max hp penalty on acquire and does not double-apply it on combat start', () => {
    const gs = {
      player: {
        maxHp: 50,
        hp: 40,
      },
    };

    ITEMS.boss_soul_mirror.onAcquire(gs);

    expect(gs.player.maxHp).toBe(35);
    expect(gs.player.hp).toBe(35);

    ITEMS.boss_soul_mirror.passive(gs, Trigger.COMBAT_START);

    expect(gs.player.maxHp).toBe(35);
    expect(gs.player.hp).toBe(35);
    expect(gs._bossSoulMirrorRevived).toBe(false);
  });

  it('applies merchants_pendant to standard shop purchases through the shop_buy runtime hook', () => {
    const gs = {
      player: {
        gold: 50,
        maxHp: 40,
        hp: 20,
        items: ['merchants_pendant'],
      },
      heal: vi.fn(),
      addLog: vi.fn(),
      triggerItems(trigger, data) {
        return ItemSystem.triggerItems(this, trigger, data);
      },
    };

    const result = shopBuyPotion(gs, 25);

    expect(result).toBe('❤️ 체력 30 회복. 남은 골드: 25');
    expect(gs.player.gold).toBe(25);
    expect(gs.player.maxHp).toBe(41);
    expect(gs.player.hp).toBe(21);
  });
});
