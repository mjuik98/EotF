import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { ITEMS } from '../data/items.js';
import { SETS } from '../game/shared/progression/set_bonus_catalog.js';

describe('set_bonus_catalog', () => {
  it('keeps player-facing set bonus labels in Korean', () => {
    expect(SETS.void_set.name).toBe('공허의 삼위일체');
    expect(SETS.void_set.bonuses[2].label).toBe('공허의 공명 — 비용 0인 카드 사용 시 잔향 +5');
    expect(SETS.void_set.bonuses[3].label).toBe('공허의 완성 — 약화된 적 공격 시 피해 +15%');
    expect(SETS.abyssal_set.name).toBe('심연의 삼위일체');
    expect(SETS.abyssal_set.bonuses[2].label).toBe('심연의 각성 — 잔향 게이지 최대치 +20%');
    expect(SETS.abyssal_set.bonuses[3].label).toBe('심연의 완성 — 모든 피해 +15% + 턴 시작 시 잔향 +15');
    expect(SETS.ancient_set.name).toBe('고대인의 유산');
    expect(SETS.ancient_set.items).toEqual([
      'ancient_handle',
      'ancient_leather',
      'ancient_belt',
      'ancient_cape',
      'ancient_blade',
      'ancient_scroll',
    ]);
    expect(SETS.ancient_set.bonuses[2].label).toBe('고대의 육신 — 최대 체력 +10');
    expect(SETS.ancient_set.bonuses[4].label).toBe('고대의 지혜 — 전투 시작 시 카드 1장 드로우');
    expect(SETS.ancient_set.bonuses[5].label).toBe('고대의 계승 — 공격 피해 +6');
    expect(SETS.holy_grail.bonuses[2].label).toBe('성배의 자비 — 초과 회복량을 방어막으로 전환');
    expect(SETS.iron_fortress.bonuses[5].label).toBe('철옹성의 완성 — 턴 시작 시 방어막이 40 이상이면 에너지 1 회복');
  });

  it('only exposes sets whose members are all defined in the live item catalog', () => {
    const undefinedMembers = Object.entries(SETS).flatMap(([setKey, setDef]) => (
      (setDef.items || [])
        .filter((itemId) => !ITEMS[itemId])
        .map((itemId) => ({ setKey, itemId }))
    ));

    expect(undefinedMembers).toEqual([]);
  });

  it('keeps charge metadata attached only to defined items', () => {
    const source = readFileSync(new URL('../data/items.js', import.meta.url), 'utf8');
    const block = source.match(/const ITEM_CHARGE_META = \{([\s\S]*?)\n\};/);
    const chargeItemIds = [...(block?.[1]?.matchAll(/^\s*([a-z0-9_]+):\s*\{/gm) || [])].map((match) => match[1]);

    expect(block).not.toBeNull();
    expect(chargeItemIds.filter((itemId) => !ITEMS[itemId])).toEqual([]);
  });
});
