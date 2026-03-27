import { describe, expect, it } from 'vitest';
import {
  buildClassLoadoutCustomizationPresentation,
  clearClassLoadoutPreset,
  resolveClassStartingLoadout,
  setActiveClassLoadoutPresetSlot,
  saveLevel11LoadoutPreset,
  saveLevel12LoadoutPreset,
} from '../game/shared/progression/class_loadout_preset_use_case.js';

function createMeta(level = 12) {
  return {
    codex: {
      cards: new Set(['blade_dance', 'charge', 'arcane_storm']),
      items: new Set(['guardian_seal', 'dull_blade']),
    },
    classProgress: {
      levels: { swordsman: level },
      xp: { swordsman: 2200 },
      pendingSummaries: [],
      loadoutPresets: {},
    },
  };
}

function createData() {
  return {
    cards: {
      strike: { id: 'strike', name: 'Strike' },
      defend: { id: 'defend', name: 'Defend' },
      heavy_blow: { id: 'heavy_blow', name: 'Heavy Blow' },
      blade_dance: { id: 'blade_dance', name: 'Blade Dance' },
      charge: { id: 'charge', name: 'Charge' },
      arcane_storm: { id: 'arcane_storm', name: 'Arcane Storm' },
    },
    items: {
      dull_blade: { id: 'dull_blade', name: 'Dull Blade' },
      guardian_seal: { id: 'guardian_seal', name: 'Guardian Seal' },
    },
    startDecks: {
      swordsman: ['strike', 'defend', 'heavy_blow'],
    },
    upgradeMap: {
      strike: 'strike_plus',
      defend: 'defend_plus',
      heavy_blow: 'heavy_blow_plus',
      blade_dance: 'blade_dance_plus',
      charge: 'charge_plus',
      arcane_storm: 'arcane_storm_plus',
    },
  };
}

function createClassMeta() {
  return {
    class: 'swordsman',
    startDeck: ['strike', 'defend', 'heavy_blow'],
    startRelic: 'dull_blade',
  };
}

describe('class_loadout_preset_use_case', () => {
  it('saves valid presets and builds customized starting loadout previews', () => {
    const meta = createMeta(12);
    const data = createData();
    const classMeta = createClassMeta();

    const level11 = saveLevel11LoadoutPreset(meta, 'swordsman', {
      type: 'swap',
      removeIndex: 2,
      addCardId: 'blade_dance',
    }, {
      classLevel: 12,
      classMeta,
      data,
    });
    const level12 = saveLevel12LoadoutPreset(meta, 'swordsman', 'guardian_seal', {
      classLevel: 12,
      classMeta,
      data,
    });
    const presentation = buildClassLoadoutCustomizationPresentation(meta, 'swordsman', {
      classLevel: 12,
      classMeta,
      data,
    });

    expect(level11).toEqual({
      type: 'swap',
      removeIndex: 2,
      removeCardId: 'heavy_blow',
      addCardId: 'blade_dance',
    });
    expect(level12).toEqual({ bonusRelicId: 'guardian_seal' });
    expect(presentation.previewDeck).toEqual(['strike', 'defend', 'blade_dance']);
    expect(presentation.previewRelicIds).toEqual(['dull_blade', 'guardian_seal']);
    expect(presentation.level11Preset).toEqual(level11);
    expect(presentation.level12Preset).toEqual(level12);
    expect(presentation.eligibleSwapAddCardIds).toEqual(['blade_dance', 'charge']);
    expect(presentation.eligibleBonusRelicIds).toEqual(['guardian_seal']);
  });

  it('rejects invalid presets and falls back to the base loadout', () => {
    const meta = createMeta(11);
    const data = createData();
    const classMeta = createClassMeta();

    expect(saveLevel11LoadoutPreset(meta, 'swordsman', {
      type: 'swap',
      removeIndex: 1,
      addCardId: 'arcane_storm',
    }, {
      classLevel: 11,
      classMeta,
      data,
    })).toBeNull();

    expect(saveLevel12LoadoutPreset(meta, 'swordsman', 'dull_blade', {
      classLevel: 12,
      classMeta,
      data,
    })).toBeNull();

    const resolved = resolveClassStartingLoadout(meta, 'swordsman', {
      classLevel: 11,
      classMeta,
      data,
    });

    expect(resolved.deck).toEqual(['strike', 'defend', 'heavy_blow']);
    expect(resolved.relicIds).toEqual(['dull_blade']);

    clearClassLoadoutPreset(meta, 'swordsman', 'level11');
   clearClassLoadoutPreset(meta, 'swordsman', 'level12');

    expect(meta.classProgress.loadoutPresets.swordsman).toEqual({
      activeSlot: 'slot1',
      level11: null,
      level12: null,
      slotEntries: {
        slot1: {
          level11: null,
          level12: null,
        },
        slot2: {
          level11: null,
          level12: null,
        },
        slot3: {
          level11: null,
          level12: null,
        },
      },
    });
  });

  it('surfaces invalid saved presets as warnings and summary state', () => {
    const meta = createMeta(12);
    const data = createData();
    const classMeta = createClassMeta();

    meta.codex.cards = new Set();
    meta.codex.items = new Set();
    meta.classProgress.loadoutPresets.swordsman = {
      level11: {
        type: 'swap',
        removeIndex: 2,
        removeCardId: 'heavy_blow',
        addCardId: 'blade_dance',
      },
      level12: {
        bonusRelicId: 'guardian_seal',
      },
    };

    const presentation = buildClassLoadoutCustomizationPresentation(meta, 'swordsman', {
      classLevel: 12,
      classMeta,
      data,
    });

    expect(presentation.level11Preset).toBeNull();
    expect(presentation.level12Preset).toBeNull();
    expect(presentation.previewDeck).toEqual(['strike', 'defend', 'heavy_blow']);
    expect(presentation.previewRelicIds).toEqual(['dull_blade']);
    expect(presentation.hasInvalidPreset).toBe(true);
    expect(presentation.invalidWarnings).toEqual([
      'Lv.11 시작 덱 프리셋을 적용할 수 없습니다. 저장된 설정을 확인하세요.',
      'Lv.12 시작 유물 프리셋을 적용할 수 없습니다. 저장된 설정을 확인하세요.',
    ]);
    expect(presentation.cardSummaryLine).toBe('프리셋 확인 필요');
  });

  it('accepts unlocked mastery rewards as valid preset candidates before codex discovery', () => {
    const meta = createMeta(12);
    const data = {
      ...createData(),
      unlockedCardIds: ['blade_dance'],
      unlockedRelicIds: ['guardian_seal'],
    };
    const classMeta = createClassMeta();

    meta.codex.cards = new Set();
    meta.codex.items = new Set();
    meta.classProgress.loadoutPresets.swordsman = {
      level11: {
        type: 'swap',
        removeIndex: 2,
        removeCardId: 'heavy_blow',
        addCardId: 'blade_dance',
      },
      level12: {
        bonusRelicId: 'guardian_seal',
      },
    };

    const presentation = buildClassLoadoutCustomizationPresentation(meta, 'swordsman', {
      classLevel: 12,
      classMeta,
      data,
    });

    expect(presentation.level11Preset).toMatchObject({
      type: 'swap',
      removeIndex: 2,
      addCardId: 'blade_dance',
    });
    expect(presentation.level12Preset).toEqual({ bonusRelicId: 'guardian_seal' });
    expect(presentation.previewDeck).toEqual(['strike', 'defend', 'blade_dance']);
    expect(presentation.previewRelicIds).toEqual(['dull_blade', 'guardian_seal']);
    expect(presentation.hasInvalidPreset).toBe(false);
    expect(presentation.invalidWarnings).toEqual([]);
  });

  it('switches between multiple saved build slots and resolves the active slot loadout', () => {
    const meta = createMeta(12);
    const data = createData();
    const classMeta = createClassMeta();

    saveLevel11LoadoutPreset(meta, 'swordsman', {
      type: 'swap',
      removeIndex: 2,
      addCardId: 'blade_dance',
    }, {
      classLevel: 12,
      classMeta,
      data,
    });
    saveLevel12LoadoutPreset(meta, 'swordsman', 'guardian_seal', {
      classLevel: 12,
      classMeta,
      data,
    });

    expect(setActiveClassLoadoutPresetSlot(meta, 'swordsman', 'slot2')).toBe('slot2');

    saveLevel11LoadoutPreset(meta, 'swordsman', {
      type: 'upgrade',
      targetIndex: 0,
    }, {
      classLevel: 12,
      classMeta,
      data,
    });

    const presentation = buildClassLoadoutCustomizationPresentation(meta, 'swordsman', {
      classLevel: 12,
      classMeta,
      data,
    });
    const resolved = resolveClassStartingLoadout(meta, 'swordsman', {
      classLevel: 12,
      classMeta,
      data,
    });

    expect(presentation.activeSlot).toBe('slot2');
    expect(presentation.availableSlots).toEqual([
      expect.objectContaining({ id: 'slot1', hasPreset: true }),
      expect.objectContaining({ id: 'slot2', hasPreset: true, active: true }),
      expect.objectContaining({ id: 'slot3', hasPreset: false }),
    ]);
    expect(resolved.deck).toEqual(['strike_plus', 'defend', 'heavy_blow']);
    expect(resolved.relicIds).toEqual(['dull_blade']);
    expect(meta.classProgress.loadoutPresets.swordsman.activeSlot).toBe('slot2');
  });
});
