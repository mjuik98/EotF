import { describe, expect, it } from 'vitest';

import {
  buildMetaSave,
  buildRunSave,
  hydrateMetaState,
  hydrateRunState,
} from '../game/shared/save/save_repository.js';
import { ITEMS } from '../data/items.js';
import { Trigger } from '../game/data/triggers.js';
import { ItemSystem } from '../game/shared/progression/item_system.js';
import { shopBuyPotion } from '../game/features/event/application/event_shop_actions.js';

function createRunState() {
  return {
    player: {
      hp: 20,
      maxHp: 30,
      deck: ['strike'],
      gold: 10,
      buffs: { regen: 2 },
      hand: ['temp'],
      upgradedCards: new Set(['strike+']),
    },
    combat: { active: false },
    currentRegion: 1,
    currentFloor: 3,
    regionFloors: { region1: 3 },
    regionRoute: { region1: ['1-1', '1-2'] },
    mapNodes: { id: 'map' },
    visitedNodes: new Set(['1-1']),
    currentNode: '1-1',
    stats: { kills: 1 },
    worldMemory: { shrineSeen: true },
  };
}

describe('save_repository', () => {
  it('buildRunSave detaches nested runtime objects from the live game state', () => {
    const gs = createRunState();

    const save = buildRunSave(gs, 2);

    gs.regionFloors.region1 = 99;
    gs.regionRoute.region1.push('1-3');
    gs.stats.kills = 99;
    gs.worldMemory.shrineSeen = false;

    expect(save.regionFloors).toEqual({ region1: 3 });
    expect(save.regionRoute).toEqual({ region1: ['1-1', '1-2'] });
    expect(save.stats).toEqual({ kills: 1 });
    expect(save.worldMemory).toEqual({ shrineSeen: true });
  });

  it('hydrateMetaState preserves the persisted payload while hydrating codex sets', () => {
    const gs = {
      meta: {
        codex: {
          enemies: new Set(),
          cards: new Set(),
          items: new Set(),
        },
      },
    };
    const persisted = {
      codex: {
        enemies: ['wolf'],
        cards: ['strike'],
        items: ['potion'],
      },
    };

    hydrateMetaState(gs, persisted);

    expect(gs.meta.codex.enemies).toEqual(new Set(['wolf']));
    expect(gs.meta.codex.cards).toEqual(new Set(['strike']));
    expect(gs.meta.codex.items).toEqual(new Set(['potion']));
    expect(persisted.codex.enemies).toEqual(['wolf']);
    expect(persisted.codex.cards).toEqual(['strike']);
    expect(persisted.codex.items).toEqual(['potion']);
  });

  it('detaches nested analytics data when building and hydrating meta saves', () => {
    const gs = {
      meta: {
        analytics: {
          totals: { runs: 3, victories: 2 },
          classes: {
            mage: { runs: 2, victories: 2 },
          },
        },
        codex: {
          enemies: new Set(),
          cards: new Set(),
          items: new Set(),
        },
      },
    };

    const save = buildMetaSave(gs, 2);
    gs.meta.analytics.totals.runs = 99;

    expect(save.analytics).toEqual({
      totals: { runs: 3, victories: 2 },
      classes: {
        mage: { runs: 2, victories: 2 },
      },
    });

    const loaded = {
      meta: {
        analytics: {
          totals: { runs: 0, victories: 0 },
          classes: {},
        },
        codex: {
          enemies: new Set(),
          cards: new Set(),
          items: new Set(),
        },
      },
    };
    hydrateMetaState(loaded, save);
    save.analytics.totals.runs = 77;

    expect(loaded.meta.analytics.totals.runs).toBe(3);
    expect(loaded.meta.analytics.classes.mage.runs).toBe(2);
  });

  it('persists phoenix_feather game-long revive usage through save hydration', () => {
    const gs = createRunState();
    gs.player.maxHp = 40;
    gs.player.hp = 3;
    gs.player.items = ['phoenix_feather'];
    gs.addLog = () => {};

    expect(ITEMS.phoenix_feather.passive(gs, Trigger.PRE_DEATH)).toBe(true);
    expect(gs.player._itemState.phoenix_feather.used).toBe(true);

    const save = buildRunSave(gs, 2);
    const loaded = createRunState();
    hydrateRunState(loaded, save);

    expect(loaded.player._itemState.phoenix_feather.used).toBe(true);
    expect(ITEMS.phoenix_feather.passive(loaded, Trigger.PRE_DEATH)).toBeUndefined();
  });

  it('does not reapply boss_soul_mirror max hp penalty after save hydration', () => {
    const gs = createRunState();
    gs.player.items = ['boss_soul_mirror'];

    ITEMS.boss_soul_mirror.onAcquire(gs);
    expect(gs.player.maxHp).toBe(15);
    expect(gs.player.hp).toBe(15);

    const save = buildRunSave(gs, 2);
    const loaded = createRunState();
    hydrateRunState(loaded, save);

    ITEMS.boss_soul_mirror.passive(loaded, Trigger.COMBAT_START);

    expect(loaded.player.maxHp).toBe(15);
    expect(loaded.player.hp).toBe(15);
    expect(loaded.player._itemState.boss_soul_mirror.penaltyApplied).toBe(true);
  });

  it('does not reapply boss_black_lotus hand limit penalty after save hydration', () => {
    const gs = createRunState();
    gs.player.items = ['boss_black_lotus'];
    gs.player._handCapMinus = 0;

    ITEMS.boss_black_lotus.onAcquire(gs);
    expect(gs.player._handCapMinus).toBe(1);

    const save = buildRunSave(gs, 2);
    const loaded = createRunState();
    loaded.player._handCapMinus = 0;
    hydrateRunState(loaded, save);

    ITEMS.boss_black_lotus.passive(loaded, Trigger.COMBAT_START);

    expect(loaded.player._handCapMinus).toBe(1);
    expect(loaded.player._itemState.boss_black_lotus.penaltyApplied).toBe(true);
  });

  it('preserves ancient_battery once-per-floor usage across save hydration', () => {
    const gs = createRunState();
    gs.currentFloor = 4;
    gs.player.gold = 80;
    gs.player.items = ['ancient_battery'];
    gs.heal = () => {};
    gs.triggerItems = function triggerItems(trigger, data) {
      return ItemSystem.triggerItems(this, trigger, data);
    };

    expect(shopBuyPotion(gs, 25)).toBe('❤️ 체력 30 회복. 남은 골드: 80');
    expect(gs.player.gold).toBe(80);
    expect(gs.player._itemState.ancient_battery.usedFloor).toBe(4);

    const save = buildRunSave(gs, 2);
    const loaded = createRunState();
    loaded.heal = () => {};
    loaded.triggerItems = function triggerItems(trigger, data) {
      return ItemSystem.triggerItems(this, trigger, data);
    };
    hydrateRunState(loaded, save);

    expect(shopBuyPotion(loaded, 25)).toBe('❤️ 체력 30 회복. 남은 골드: 55');
    expect(loaded.player.gold).toBe(55);
    expect(loaded.player._itemState.ancient_battery.usedFloor).toBe(4);
  });

  it('strips migrated legacy relic state fields when saving and hydrating', () => {
    const gs = createRunState();
    gs.player.items = ['phoenix_feather', 'energy_core', 'ancient_battery'];
    gs.player._phoenixUsed = true;
    gs.player._energyCoreCount = 2;
    gs.player._ancientBatteryUsedFloor = 7;
    gs.player._itemDerivedHandCapMinus = 1;

    const save = buildRunSave(gs, 2);

    expect(save.player._phoenixUsed).toBeUndefined();
    expect(save.player._energyCoreCount).toBeUndefined();
    expect(save.player._ancientBatteryUsedFloor).toBeUndefined();
    expect(save.player._itemDerivedHandCapMinus).toBeUndefined();

    const loaded = createRunState();
    hydrateRunState(loaded, {
      ...save,
      player: {
        ...save.player,
        items: ['phoenix_feather', 'energy_core', 'ancient_battery'],
        _phoenixUsed: true,
        _energyCoreCount: 2,
        _ancientBatteryUsedFloor: 7,
        _itemDerivedHandCapMinus: 1,
      },
    });

    expect(loaded.player._itemState.phoenix_feather.used).toBe(true);
    expect(loaded.player._itemState.energy_core.count).toBe(2);
    expect(loaded.player._itemState.ancient_battery.usedFloor).toBe(7);
    expect(loaded.player._phoenixUsed).toBeUndefined();
    expect(loaded.player._energyCoreCount).toBeUndefined();
    expect(loaded.player._ancientBatteryUsedFloor).toBeUndefined();
    expect(loaded.player._itemDerivedHandCapMinus).toBeUndefined();
  });
});
