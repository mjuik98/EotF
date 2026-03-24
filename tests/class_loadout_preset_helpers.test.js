import { describe, expect, it } from 'vitest';

import {
  buildCardSummaryLine,
  buildLevel11PresetSummary,
  buildLevel12PresetSummary,
  getEligibleBonusRelicIds,
  getEligibleSwapAddCardIds,
} from '../game/shared/progression/class_loadout_preset_helpers.js';

function createMeta() {
  return {
    codex: {
      cards: new Set(['blade_dance', 'charge', 'arcane_storm']),
      items: new Set(['guardian_seal', 'dull_blade']),
    },
    classProgress: {
      levels: { swordsman: 12 },
      xp: { swordsman: 2200 },
      pendingSummaries: [],
      loadoutPresets: {},
    },
  };
}

function createData() {
  return {
    cards: {
      heavy_blow: { id: 'heavy_blow', name: 'Heavy Blow' },
      blade_dance: { id: 'blade_dance', name: 'Blade Dance' },
      charge: { id: 'charge', name: 'Charge' },
      arcane_storm: { id: 'arcane_storm', name: 'Arcane Storm' },
    },
    items: {
      dull_blade: { id: 'dull_blade', name: 'Dull Blade' },
      guardian_seal: { id: 'guardian_seal', name: 'Guardian Seal' },
    },
    upgradeMap: {
      heavy_blow: 'heavy_blow_plus',
      blade_dance: 'blade_dance_plus',
      charge: 'charge_plus',
      arcane_storm: 'arcane_storm_plus',
    },
  };
}

describe('class loadout preset helpers', () => {
  it('builds preset summaries and invalid summary text', () => {
    const data = createData();

    expect(buildLevel11PresetSummary({
      type: 'swap',
      removeCardId: 'heavy_blow',
      addCardId: 'blade_dance',
    }, data)).toBe('Heavy Blow→Blade Dance');
    expect(buildLevel12PresetSummary({ bonusRelicId: 'guardian_seal' }, data)).toBe('+Guardian Seal');
    expect(buildCardSummaryLine('Heavy Blow→Blade Dance', '+Guardian Seal', true)).toBe('프리셋 확인 필요');
  });

  it('limits eligible cards and relics to codex-owned class options', () => {
    const meta = createMeta();
    const data = createData();

    expect(getEligibleSwapAddCardIds(meta, 'swordsman', data)).toEqual(['blade_dance', 'charge']);
    expect(getEligibleBonusRelicIds(meta, 'dull_blade', data)).toEqual(['guardian_seal']);
  });
});
