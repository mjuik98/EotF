import { describe, expect, it } from 'vitest';

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
    expect(SETS.echo_set.bonuses[2].label).toBe('반향의 공명 — 공명 폭발 게이지 -20 (80에서 발동)');
    expect(SETS.echo_set.bonuses[3].label).toBe('반향의 완성 — 매 턴 자동 잔향 +20');
    expect(SETS.blood_set.bonuses[2].label).toBe('혈맹의 결의 — 최대 체력 +20');
  });
});
