import { describe, expect, it } from 'vitest';

import {
  buildItemDetailViewModel,
  formatItemDetailChargeValue,
} from '../game/features/combat/presentation/browser/item_detail_view_model.js';

describe('item_detail_view_model', () => {
  it('normalizes charge and set data for shared detail renderers', () => {
    const item = {
      id: 'void_crystal',
      name: 'Void Crystal',
      icon: 'VC',
      desc: 'Charge desc\n[세트: Void Set]',
      rarity: 'rare',
      trigger: 'combat_start',
    };
    const data = {
      items: {
        void_crystal: item,
        void_shard: { id: 'void_shard', name: 'Void Shard', icon: 'VS' },
      },
    };
    const state = {
      liveCharge: { type: 'dot', remaining: 1, label: '이번 전투 발동' },
      rarity: 'rare',
      rarityMeta: { color: '#f0d472', glow: 'rgba(240,180,41,0.4)', border: 'rgba(240,180,41,0.4)', rgb: '240,180,41' },
      setCount: 1,
      setDef: { name: 'Void Set', items: ['void_crystal', 'void_shard'], bonuses: { 2: { label: 'Bonus active' } } },
      setOwnedFlags: [true, false],
      triggerText: '전투 시작 시',
    };

    const detail = buildItemDetailViewModel('void_crystal', item, data, state);

    expect(detail.title).toBe('Void Crystal');
    expect(detail.desc).toBe('Charge desc');
    expect(detail.rarityLabel).toBe('희귀');
    expect(detail.triggerText).toBe('전투 시작 시');
    expect(detail.charge).toEqual({
      label: '이번 전투 발동',
      value: '1회 남음',
      tone: 'accent',
    });
    expect(detail.set).toEqual({
      name: 'Void Set',
      count: 1,
      total: 2,
      members: [
        { id: 'void_crystal', icon: 'VC', name: 'Void Crystal', owned: true },
        { id: 'void_shard', icon: 'VS', name: 'Void Shard', owned: false },
      ],
      bonuses: [
        { tier: 2, label: 'Bonus active', active: false },
      ],
    });
  });

  it('formats the supported charge variants', () => {
    expect(formatItemDetailChargeValue({ type: 'bool', active: true })).toBe('현재 활성화됨');
    expect(formatItemDetailChargeValue({ type: 'num', val: 2, max: 10 })).toBe('2 / 10');
    expect(formatItemDetailChargeValue({ type: 'dot', remaining: 0 })).toBe('소진됨');
  });
});
