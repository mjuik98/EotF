import { describe, expect, it } from 'vitest';

import { SETS } from '../game/shared/progression/set_bonus_catalog.js';

describe('set_bonus_catalog', () => {
  it('keeps player-facing set bonus labels in Korean', () => {
    expect(SETS.void_set.bonuses[2].label).toBe('심연의 각성 — 잔향 게이지 최대치 +20%');
    expect(SETS.void_set.bonuses[3].label).toBe('심연의 완성 — 모든 피해 +15% + 턴 시작 시 잔향 +15');
    expect(SETS.echo_set.bonuses[2].label).toBe('반향의 공명 — 공명 폭발 게이지 -20 (80에서 발동)');
    expect(SETS.echo_set.bonuses[3].label).toBe('반향의 완성 — 매 턴 자동 잔향 +20');
    expect(SETS.blood_set.bonuses[2].label).toBe('혈맹의 결의 — 최대 체력 +20');
  });
});
