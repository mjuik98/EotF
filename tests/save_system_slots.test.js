import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  SaveSystem,
  bindSaveNotifications,
  bindSaveStorage,
} from '../game/shared/save/public.js';

function createStorageAdapter() {
  const store = new Map();
  return {
    store,
    load: vi.fn((key) => store.has(key) ? JSON.parse(store.get(key)) : null),
    save: vi.fn((key, value) => {
      store.set(key, JSON.stringify(value));
      return true;
    }),
    remove: vi.fn((key) => {
      store.delete(key);
    }),
    has: vi.fn((key) => store.has(key)),
  };
}

function createGs(classId, hp = 80) {
  return {
    player: {
      class: classId,
      hp,
      maxHp: hp,
      shield: 0,
      echo: 0,
      maxEcho: 100,
      echoChain: 0,
      energy: 3,
      maxEnergy: 3,
      gold: 10,
      kills: 0,
      deck: ['strike'],
      hand: [],
      graveyard: [],
      exhausted: [],
      items: [],
      buffs: {},
      silenceGauge: 0,
      timeRiftGauge: 0,
      zeroCost: false,
      _freeCardUses: 0,
      costDiscount: 0,
      _nextCardDiscount: 0,
      _cascadeCards: [],
      _traitCardDiscounts: {},
      _mageCastCounter: 0,
      _mageLastDiscountTarget: null,
      upgradedCards: [],
      _cardUpgradeBonus: {},
      _classMasteryLevel: 1,
      _classMasteryRelicChoiceBonus: 0,
      _classMasteryOpeningDrawBonus: 0,
      _classMasteryMageOpeningDiscount: 0,
      _classMasteryHunterFirstAttackMark: 0,
      _classMasterySwordsmanResonance: 0,
      _classMasteryPaladinStartHeal: 0,
      _classMasteryBerserkerFlatDamage: 0,
      _classMasteryGuardianStartBlock: 0,
      _classMasteryBaseStartBlock: 0,
    },
    currentRegion: 0,
    currentFloor: 1,
    regionFloors: { 0: 1 },
    regionRoute: {},
    mapNodes: [],
    visitedNodes: [],
    currentNode: null,
    stats: { kills: 0 },
    worldMemory: {},
    combat: { active: false },
    meta: {
      runCount: 1,
      totalKills: 0,
      bestChain: 0,
      runConfig: { ascension: 0 },
      activeSaveSlot: 1,
    },
  };
}

describe('SaveSystem slots and bundles', () => {
  beforeEach(() => {
    bindSaveNotifications(null);
    SaveSystem.clearOutbox();
    SaveSystem.resetOutboxMetrics();
    SaveSystem.selectSlot?.(1);
  });

  it('persists separate run previews per save slot', () => {
    const storage = createStorageAdapter();
    bindSaveStorage(storage);

    const slot1Gs = createGs('swordsman', 80);
    const slot2Gs = createGs('mage', 55);

    expect(SaveSystem.saveRun({ gs: slot1Gs, slot: 1, isGameStarted: () => true }).status).toBe('saved');
    expect(SaveSystem.saveRun({ gs: slot2Gs, slot: 2, isGameStarted: () => true }).status).toBe('saved');

    expect(storage.save).toHaveBeenCalledWith('echo_fallen_save', expect.any(Object));
    expect(storage.save).toHaveBeenCalledWith('echo_fallen_save_slot2', expect.any(Object));

    expect(SaveSystem.readRunPreview({ slot: 1 })).toEqual(expect.objectContaining({
      player: expect.objectContaining({ class: 'swordsman', hp: 80 }),
    }));
    expect(SaveSystem.readRunPreview({ slot: 2 })).toEqual(expect.objectContaining({
      player: expect.objectContaining({ class: 'mage', hp: 55 }),
    }));
  });

  it('exports and imports slot bundles without overwriting other slots', () => {
    const storage = createStorageAdapter();
    bindSaveStorage(storage);

    const sourceGs = createGs('guardian', 99);
    sourceGs.meta.runCount = 7;
    sourceGs.meta.recentRuns = [{ runNumber: 7, outcome: 'victory', classId: 'guardian' }];

    SaveSystem.saveMeta({ gs: sourceGs, slot: 2 });
    SaveSystem.saveRun({ gs: sourceGs, slot: 2, isGameStarted: () => true });

    const bundle = SaveSystem.exportBundle({ slot: 2 });
    expect(bundle).toEqual(expect.objectContaining({
      schemaVersion: 1,
      slot: 2,
      meta: expect.objectContaining({ runCount: 7 }),
      run: expect.objectContaining({
        player: expect.objectContaining({ class: 'guardian', hp: 99 }),
      }),
    }));

    const slot3Gs = createGs('rogue', 45);
    SaveSystem.saveRun({ gs: slot3Gs, slot: 3, isGameStarted: () => true });

    SaveSystem.importBundle(bundle, { slot: 1 });

    expect(SaveSystem.readRunPreview({ slot: 1 })).toEqual(expect.objectContaining({
      player: expect.objectContaining({ class: 'guardian', hp: 99 }),
    }));
    expect(SaveSystem.readRunPreview({ slot: 3 })).toEqual(expect.objectContaining({
      player: expect.objectContaining({ class: 'rogue', hp: 45 }),
    }));
  });
});
