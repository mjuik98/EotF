import { describe, expect, it } from 'vitest';

import {
  buildRunSave,
  hydrateMetaState,
  hydrateRunState,
} from '../game/shared/save/save_repository.js';
import { ITEMS } from '../data/items.js';
import { Trigger } from '../game/data/triggers.js';

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

  it('persists phoenix_feather game-long revive usage through save hydration', () => {
    const gs = createRunState();
    gs.player.maxHp = 40;
    gs.player.hp = 3;
    gs.player.items = ['phoenix_feather'];
    gs.addLog = () => {};

    expect(ITEMS.phoenix_feather.passive(gs, Trigger.PRE_DEATH)).toBe(true);
    expect(gs.player._phoenixUsed).toBe(true);

    const save = buildRunSave(gs, 2);
    const loaded = createRunState();
    hydrateRunState(loaded, save);

    expect(loaded.player._phoenixUsed).toBe(true);
    expect(ITEMS.phoenix_feather.passive(loaded, Trigger.PRE_DEATH)).toBeUndefined();
  });
});
