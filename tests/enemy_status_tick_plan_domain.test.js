import { describe, expect, it, vi } from 'vitest';

import { buildEnemyStatusTickPlan } from '../game/features/combat/domain/enemy_status_tick_plan_domain.js';

describe('enemy_status_tick_plan_domain', () => {
  it('stops planning after lethal poison and preserves poison duration updates for state application', () => {
    const plan = buildEnemyStatusTickPlan(
      {
        hp: 10,
        maxHp: 20,
        statusEffects: {
          poisoned: 2,
          poisonDuration: 3,
          burning: 1,
        },
      },
      0,
    );

    expect(plan).toEqual([
      {
        type: 'poison',
        dmg: 10,
        color: '#44ff88',
        enemyDied: true,
        statusUpdates: [],
      },
    ]);
  });

  it('builds a mixed survive-path plan with countdown and cleanup steps', () => {
    const poisonDamageScaleFn = vi.fn().mockReturnValue({ amount: 12 });
    const plan = buildEnemyStatusTickPlan(
      {
        hp: 40,
        maxHp: 40,
        statusEffects: {
          poisoned: 2,
          poisonDuration: 2,
          burning: 1,
          abyss_regen: 3,
          marked: 2,
          immune: 1,
          doom: 2,
        },
      },
      1,
      { poisonDamageScaleFn },
    );

    expect(poisonDamageScaleFn).toHaveBeenCalledWith({ amount: 10, targetIdx: 1 });
    expect(plan).toEqual([
      {
        type: 'poison',
        dmg: 12,
        color: '#44ff88',
        enemyDied: false,
        statusUpdates: [{ statusKey: 'poisonDuration', nextValue: 1 }],
      },
      {
        type: 'burning',
        dmg: 5,
        color: '#ff8844',
        enemyDied: false,
        statusUpdates: [{ statusKey: 'burning', nextValue: undefined }],
      },
      {
        type: 'abyss_regen',
        heal: 3,
        projectedHp: 26,
        statusUpdates: [],
      },
      {
        type: 'marked_tick',
        statusUpdates: [{ statusKey: 'marked', nextValue: 1 }],
      },
      {
        type: 'immune_tick',
        statusUpdates: [{ statusKey: 'immune', nextValue: undefined }],
      },
      {
        type: 'doom_countdown',
        remaining: 1,
        statusUpdates: [{ statusKey: 'doom', nextValue: 1 }],
      },
    ]);
  });
});
