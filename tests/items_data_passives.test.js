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
  it('uses emoji icons for all relic definitions', () => {
    const invalidIcons = Object.entries(ITEMS)
      .filter(([, item]) => !/\p{Extended_Pictographic}/u.test(String(item.icon || '')))
      .map(([id, item]) => ({ id, icon: item.icon, name: item.name }));

    expect(invalidIcons).toEqual([]);
  });

  it('restores the first exhausted card through liquid_memory and resets on combat start', () => {
    const gs = {
      _itemRuntime: {
        liquid_memory: { used: false },
      },
      player: {
        deck: ['guard'],
        exhausted: ['strike'],
      },
      addLog: vi.fn(),
    };

    ITEMS.liquid_memory.passive(gs, Trigger.CARD_EXHAUST, { cardId: 'strike' });

    expect(gs._itemRuntime.liquid_memory.used).toBe(true);
    expect(gs.player.exhausted).toEqual([]);
    expect(gs.player.deck).toEqual(['guard', 'strike']);

    ITEMS.liquid_memory.passive(gs, Trigger.COMBAT_START);

    expect(gs._itemRuntime.liquid_memory.used).toBe(false);
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
    expect(gs._itemRuntime.balanced_scale.active).toBe(false);
    expect(gs._itemRuntime.balanced_scale.drawReset).toBe(true);

    ITEMS.balanced_scale.passive(gs, Trigger.TURN_END);

    expect(gs.player.drawCount).toBe(0);
    expect(gs._itemRuntime.balanced_scale.drawReset).toBe(false);
  });

  it('removes ancient_scroll temporary cards from combat-local piles without touching matching permanent deck copies', () => {
    const gs = {
      player: {
        items: ['ancient_scroll'],
        hand: [],
        deck: ['guard'],
        drawPile: [],
        discardPile: [],
        graveyard: [],
        exhausted: [],
      },
      addLog: vi.fn(),
    };

    vi.spyOn(Math, 'random').mockReturnValue(0);

    ItemSystem.triggerItems(gs, Trigger.COMBAT_START);

    const tempCardId = gs._itemRuntime?.ancient_scroll?.tempCardId;
    expect(typeof tempCardId).toBe('string');
    expect(gs.player.hand).toContain(tempCardId);

    gs.player.deck.push(tempCardId);
    gs.player.drawPile.push(tempCardId);
    gs.player.discardPile.push(tempCardId);
    gs.player.graveyard.push(tempCardId);
    gs.player.exhausted.push(tempCardId);

    ItemSystem.triggerItems(gs, Trigger.COMBAT_END);

    expect(gs._itemRuntime?.ancient_scroll?.tempCardId).toBeNull();
    expect(gs.player.hand).not.toContain(tempCardId);
    expect(gs.player.deck).toEqual(['guard', tempCardId]);
    expect(gs.player.drawPile).not.toContain(tempCardId);
    expect(gs.player.discardPile).not.toContain(tempCardId);
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
    expect(ITEMS.dimension_pocket.desc).toBe('획득: 최대 에너지 +1 / 턴 시작: 드로우 더미에 [노이즈] 1장 추가');
  });

  it('caps energy_core growth after two boss combat victories', () => {
    const gs = {
      player: {
        maxEnergy: 3,
        energy: 2,
        _itemState: {
          energy_core: { count: 0 },
        },
      },
      markDirty: vi.fn(),
      addLog: vi.fn(),
    };

    ITEMS.energy_core.passive(gs, Trigger.COMBAT_END, { isBoss: true });
    ITEMS.energy_core.passive(gs, Trigger.COMBAT_END, { isBoss: true });
    ITEMS.energy_core.passive(gs, Trigger.COMBAT_END, { isBoss: true });

    expect(gs.player._itemState.energy_core.count).toBe(2);
    expect(gs.player.maxEnergy).toBe(5);
    expect(gs.player.energy).toBe(4);
    expect(gs.markDirty).toHaveBeenCalledTimes(2);
  });

  it('tracks abyssal_eye shield-ignore ownership in item runtime while keeping the global compatibility flag in sync', () => {
    const gs = {
      _itemRuntime: {},
      _ignoreShield: false,
      addLog: () => {},
    };

    ITEMS.abyssal_eye.passive(gs, Trigger.COMBAT_START);
    expect(gs._itemRuntime.abyssal_eye.ignoreShield).toBe(true);
    expect(gs._ignoreShield).toBe(true);

    ITEMS.abyssal_eye.passive(gs, Trigger.COMBAT_END);
    expect(gs._itemRuntime.abyssal_eye.ignoreShield).toBe(false);
    expect(gs._ignoreShield).toBe(false);
  });

  it('boosts special reward card choices through dimension_key', () => {
    expect(
      ITEMS.dimension_key.passive({}, Trigger.REWARD_GENERATE, { type: 'card', count: 3 }),
    ).toBe(4);
    expect(
      ITEMS.dimension_key.passive({}, Trigger.REWARD_GENERATE, { type: 'item', count: 3 }),
    ).toBeUndefined();
  });

  it('labels combat-scoped counter relics with their per-combat scope', () => {
    expect(ITEMS.tally_stone.desc).toBe('이번 전투에서 피해를 줄 때: 집계 +1 / 5회 누적 시: 방어막 12 획득 후 초기화');
    expect(ITEMS.echo_bell.desc).toBe('이번 전투에서 카드 5장 사용할 때마다: 잔향 5 충전 / 카드 10장 사용할 때마다: 잔향 15 충전');
    expect(ITEMS.clockwork_butterfly.desc).toBe('이번 전투에서 턴 시작 3회마다: 에너지 최대치만큼 회복');
    expect(ITEMS.infinite_loop.desc).toBe('이번 전투에서 카드 3장 사용할 때마다: 손패의 무작위 카드 1장 소모 후 복사본 2장 추가');
    expect(ITEMS.boss_black_lotus.desc).toBe('상시: 손패 제한 -1 / 이번 전투에서 카드 5장 사용할 때마다: 카드 2장 드로우');
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
      _itemRuntime: {
        infinite_loop: { count: 2 },
      },
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

  it('preserves before_card_cost payload context through crystal_ball', () => {
    const gs = {
      _itemRuntime: {
        crystal_ball: { discounted: new Set(['strike']) },
      },
      player: {
        items: ['crystal_ball'],
      },
    };

    expect(ItemSystem.triggerItems(gs, Trigger.BEFORE_CARD_COST, {
      cardId: 'strike',
      cost: 2,
      baseCost: 2,
    })).toEqual({
      cardId: 'strike',
      cost: 2,
      baseCost: 2,
      costDelta: -1,
    });
  });

  it('does not apply hand-scoped cost relics without a handIndex payload', () => {
    const gs = {
      player: {
        items: ['everlasting_oil', 'glitch_circuit'],
      },
      _handScopedRuntime: {
        costTargets: {
          oilTargetIndex: 0,
          glitch0Index: 0,
          glitchPlusIndex: 1,
        },
      },
    };

    expect(ItemSystem.triggerItems(gs, Trigger.BEFORE_CARD_COST, {
      cardId: 'strike',
      cost: 2,
      baseCost: 2,
    })).toEqual({
      cardId: 'strike',
      cost: 2,
      baseCost: 2,
    });
  });

  it('blocks healing through titan_heart using the heal_amount trigger', () => {
    const gs = {
      player: {
        items: ['titan_heart'],
      },
    };

    expect(ItemSystem.triggerItems(gs, Trigger.HEAL_AMOUNT, 8)).toBe(0);
  });

  it('routes titans_belt healing through the live heal hook instead of direct hp mutation', () => {
    const gs = {
      player: {
        items: ['titans_belt', 'titan_heart'],
        maxHp: 30,
        hp: 10,
      },
      markDirty: vi.fn(),
      addLog: vi.fn(),
      heal(amount) {
        const adjusted = this.triggerItems('heal_amount', amount);
        const resolved = typeof adjusted === 'number' ? adjusted : amount;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + Math.max(0, resolved));
        return { healed: resolved };
      },
      triggerItems(trigger, data) {
        return ItemSystem.triggerItems(this, trigger, data);
      },
    };

    ItemSystem.triggerItems(gs, Trigger.COMBAT_START);

    expect(gs.player.maxHp).toBe(45);
    expect(gs.player.hp).toBe(10);
  });

  it('routes acidic_vial poison growth through applyEnemyStatus instead of direct enemy mutation', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const gs = {
      _selectedTarget: 0,
      combat: {
        enemies: [
          { hp: 12, statusEffects: { poisoned: 2, poisonDuration: 1 } },
        ],
      },
      applyEnemyStatus: vi.fn(),
    };

    ITEMS.acidic_vial.passive(gs, Trigger.DEAL_DAMAGE, { amount: 5, targetIdx: 0 });

    expect(gs.applyEnemyStatus).toHaveBeenCalledWith('poisoned', 1, 0, { name: '산성 유리병', type: 'item' });
    expect(gs.combat.enemies[0].statusEffects.poisoned).toBe(2);
    expect(gs.combat.enemies[0].statusEffects.poisonDuration).toBe(1);
    randomSpy.mockRestore();
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
    expect(ITEMS.ancient_battery.desc).toBe('층마다 처음 구매하는 물약: 비용 없음');
  });

  it('adds steady combat and floor gold through worn_pouch runtime hooks', () => {
    const gs = {
      player: {
        gold: 10,
        items: ['worn_pouch'],
      },
      addGold(amount) {
        this.player.gold += amount;
      },
    };

    ItemSystem.triggerItems(gs, Trigger.COMBAT_START);
    ItemSystem.triggerItems(gs, Trigger.FLOOR_START);

    expect(gs.player.gold).toBe(18);
    expect(ITEMS.worn_pouch.desc).toBe('전투 시작: 골드 5 획득 / 층 이동: 골드 3 획득');
  });

  it('adds a combat-start echo charge while preserving dull_blade card-play procs', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    const gs = {
      player: {
        echo: 0,
        items: ['dull_blade'],
      },
      addEcho(amount) {
        this.player.echo += amount;
      },
    };

    ItemSystem.triggerItems(gs, Trigger.COMBAT_START);
    ItemSystem.triggerItems(gs, Trigger.CARD_PLAY, { cardId: 'strike', cost: 1 });

    expect(gs.player.echo).toBe(15);
    expect(ITEMS.dull_blade.desc).toBe('전투 시작: 잔향 5 충전 / 카드 사용 시 10% 확률: 잔향 10 충전');

    randomSpy.mockRestore();
  });

  it('adds sustain to blood_shard through the active enemy_kill path', () => {
    const gs = {
      player: {
        echo: 0,
        hp: 10,
        maxHp: 20,
        items: ['blood_shard'],
      },
      addEcho(amount) {
        this.player.echo += amount;
      },
      heal: vi.fn((amount) => {
        gs.player.hp = Math.min(gs.player.maxHp, gs.player.hp + amount);
      }),
    };

    ItemSystem.triggerItems(gs, Trigger.ENEMY_KILL, { enemy: { hp: 0 }, idx: 0 });

    expect(gs.player.echo).toBe(10);
    expect(gs.player.hp).toBe(11);
    expect(gs.heal).toHaveBeenCalledWith(1, { name: '핏빛 파편', type: 'item' });
    expect(ITEMS.blood_shard.desc).toBe('적 처치 시: 잔향 10 충전 / 체력 1 회복');
  });

  it('turns stored echo into opening defense through void_shard runtime triggers', () => {
    const gs = {
      player: {
        echo: 60,
        shield: 0,
        items: ['void_shard'],
      },
      dispatch(action, payload) {
        return Reducers[action](this, payload);
      },
      markDirty: vi.fn(),
      addEcho(amount) {
        this.player.echo += amount;
      },
    };

    ItemSystem.triggerItems(gs, Trigger.COMBAT_START);
    ItemSystem.triggerItems(gs, Trigger.COMBAT_END);

    expect(gs.player.shield).toBe(5);
    expect(gs.player.echo).toBe(80);
    expect(ITEMS.void_shard.desc).toBe('전투 시작: 잔향 50 이상일 때 방어막 5 획득 / 전투 종료: 잔향 20 충전');
  });

  it('adds opening defense to cracked_amulet while keeping its turn-start heal', () => {
    const gs = {
      player: {
        hp: 8,
        maxHp: 20,
        shield: 0,
        items: ['cracked_amulet'],
      },
      dispatch(action, payload) {
        return Reducers[action](this, payload);
      },
      markDirty: vi.fn(),
      heal: vi.fn((amount) => {
        gs.player.hp = Math.min(gs.player.maxHp, gs.player.hp + amount);
      }),
    };

    ItemSystem.triggerItems(gs, Trigger.COMBAT_START);
    ItemSystem.triggerItems(gs, Trigger.TURN_START);

    expect(gs.player.shield).toBe(4);
    expect(gs.player.hp).toBe(10);
    expect(ITEMS.cracked_amulet.desc).toBe('전투 시작: 방어막 4 획득 / 턴 시작: 체력 2 회복');
  });

  it('adds travel gold to travelers_map on the live floor_start hook', () => {
    const gs = {
      player: {
        hp: 10,
        maxHp: 20,
        gold: 7,
        items: ['travelers_map'],
      },
      heal: vi.fn((amount) => {
        gs.player.hp = Math.min(gs.player.maxHp, gs.player.hp + amount);
      }),
      addGold(amount) {
        this.player.gold += amount;
      },
    };

    ItemSystem.triggerItems(gs, Trigger.FLOOR_START);

    expect(gs.player.hp).toBe(13);
    expect(gs.player.gold).toBe(11);
    expect(ITEMS.travelers_map.desc).toBe('층 이동: 체력 3 회복 / 골드 4 획득');
  });

  it('adds an opening echo charge to rift_talisman through combat_start', () => {
    const gs = {
      player: {
        shield: 0,
        echo: 0,
        items: ['rift_talisman'],
      },
      dispatch(action, payload) {
        return Reducers[action](this, payload);
      },
      markDirty: vi.fn(),
      addEcho(amount) {
        this.player.echo += amount;
      },
    };

    ItemSystem.triggerItems(gs, Trigger.COMBAT_START);

    expect(gs.player.shield).toBe(5);
    expect(gs.player.echo).toBe(5);
    expect(ITEMS.rift_talisman.desc).toBe('전투 시작: 방어막 5 획득 / 잔향 5 충전');
  });

  it('turns thin_codex into a stronger low-deck opener on combat_start', () => {
    const gs = {
      player: {
        deck: ['strike', 'guard'],
        shield: 0,
        items: ['thin_codex'],
      },
      dispatch: vi.fn((action, payload) => Reducers[action](gs, payload)),
      markDirty: vi.fn(),
    };

    ItemSystem.triggerItems(gs, Trigger.COMBAT_START);

    expect(gs.dispatch).toHaveBeenCalledWith(Actions.CARD_DRAW, { count: 1 });
    expect(gs.player.shield).toBe(4);
    expect(ITEMS.thin_codex.desc).toBe('전투 시작: 덱 10장 이하일 때 카드 1장 드로우 및 방어막 4 획득');
  });

  it('adds an opening heal to morning_dew while preserving the turn-start shield hook', () => {
    const gs = {
      player: {
        hp: 9,
        maxHp: 20,
        shield: 0,
        items: ['morning_dew'],
      },
      dispatch(action, payload) {
        return Reducers[action](this, payload);
      },
      markDirty: vi.fn(),
      heal: vi.fn((amount) => {
        gs.player.hp = Math.min(gs.player.maxHp, gs.player.hp + amount);
      }),
      triggerItems(trigger, data) {
        return ItemSystem.triggerItems(this, trigger, data);
      },
    };

    ItemSystem.triggerItems(gs, Trigger.COMBAT_START);
    ItemSystem.triggerItems(gs, Trigger.TURN_START);

    expect(gs.player.hp).toBe(11);
    expect(gs.player.shield).toBe(3);
    expect(ITEMS.morning_dew.desc).toBe('전투 시작: 체력 2 회복 / 턴 시작: 방어막 3 획득');
  });

  it('adds a midpoint echo payout to echo_bell while preserving the ten-card spike', () => {
    const gs = {
      _itemRuntime: {
        echo_bell: { count: 0 },
      },
      player: {
        echo: 0,
        items: ['echo_bell'],
      },
      addEcho(amount) {
        this.player.echo += amount;
      },
    };

    for (let index = 0; index < 10; index += 1) {
      ItemSystem.triggerItems(gs, Trigger.CARD_PLAY, { cardId: `card_${index}`, cost: 1 });
    }

    expect(gs.player.echo).toBe(20);
    expect(ITEMS.echo_bell.desc).toBe('이번 전투에서 카드 5장 사용할 때마다: 잔향 5 충전 / 카드 10장 사용할 때마다: 잔향 15 충전');
  });

  it('charges potion cost again after ancient_battery spends its once-per-floor shop purchase', () => {
    const gs = {
      player: {
        gold: 80,
        items: ['ancient_battery'],
      },
      heal: vi.fn(),
      triggerItems(trigger, data) {
        return ItemSystem.triggerItems(this, trigger, data);
      },
    };

    expect(shopBuyPotion(gs, 25)).toBe('❤️ 체력 30 회복. 남은 골드: 80');
    expect(shopBuyPotion(gs, 25)).toBe('❤️ 체력 30 회복. 남은 골드: 55');
    expect(gs.player.gold).toBe(55);
    expect(gs.heal).toHaveBeenCalledTimes(2);
  });

  it('refunds part of shop spending through lucky_coin on the live shop_buy path', () => {
    const gs = {
      player: {
        gold: 30,
        items: ['lucky_coin'],
      },
      heal: vi.fn(),
      addGold(amount) {
        this.player.gold += amount;
      },
      triggerItems(trigger, data) {
        return ItemSystem.triggerItems(this, trigger, data);
      },
    };

    const result = shopBuyPotion(gs, 25);

    expect(result).toBe('❤️ 체력 30 회복. 남은 골드: 8');
    expect(gs.player.gold).toBe(8);
    expect(ITEMS.lucky_coin.desc).toBe('턴 시작 5% 확률: 에너지 1 회복 / 상점 구매 시: 골드 3 획득');
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
    expect(gs._itemRuntime.boss_soul_mirror.revived).toBe(false);
  });

  it('applies merchants_pendant to standard shop purchases through the shop_buy runtime hook', () => {
    const gs = {
      player: {
        gold: 50,
        maxHp: 40,
        hp: 20,
        items: ['merchants_pendant'],
      },
      heal(amount) {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + amount);
        return { healed: amount };
      },
      addLog: vi.fn(),
      triggerItems(trigger, data) {
        return ItemSystem.triggerItems(this, trigger, data);
      },
    };

    const result = shopBuyPotion(gs, 25);

    expect(result).toBe('❤️ 체력 30 회복. 남은 골드: 25');
    expect(gs.player.gold).toBe(25);
    expect(gs.player.maxHp).toBe(41);
    expect(gs.player.hp).toBe(41);
  });

  it('blocks merchants_pendant and soul_magnet healing through titan_heart while preserving max-hp growth', () => {
    const gs = {
      player: {
        hp: 10,
        maxHp: 40,
        items: ['titan_heart', 'merchants_pendant', 'soul_magnet'],
      },
      addLog: vi.fn(),
      heal(amount) {
        const adjusted = this.triggerItems('heal_amount', amount);
        const resolved = typeof adjusted === 'number' ? adjusted : amount;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + Math.max(0, resolved));
        return { healed: resolved };
      },
      triggerItems(trigger, data) {
        return ItemSystem.triggerItems(this, trigger, data);
      },
    };

    ItemSystem.triggerItems(gs, Trigger.SHOP_BUY, { kind: 'potion', cost: 25 });
    expect(gs.player.maxHp).toBe(41);
    expect(gs.player.hp).toBe(10);

    ItemSystem.triggerItems(gs, Trigger.ENEMY_KILL, { enemy: { hp: 0 }, idx: 0 });
    expect(gs.player.maxHp).toBe(43);
    expect(gs.player.hp).toBe(10);
  });
});
