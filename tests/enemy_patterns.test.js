import { describe, expect, it } from 'vitest';
import { DATA } from '../data/game_data.js';

function createEnemyInstance(id) {
  const base = DATA.enemies[id];
  return {
    ...base,
    hp: base.maxHp,
    phase: base.phase ?? 1,
    statusEffects: {},
  };
}

describe('enemy pattern configuration', () => {
  it('applies combo attacks only to selected agile enemies', () => {
    const shadowWolf = createEnemyInstance('shadow_wolf');
    const comboAction = shadowWolf.ai(4);

    expect(comboAction.type).toBe('double');
    expect(comboAction.multi).toBe(2);
    expect(comboAction.dmg).toBe(shadowWolf.atk - 2);

    const slime = createEnemyInstance('slime');
    const slimeAction = slime.ai(4);
    expect(slimeAction.type).not.toBe('double');
    expect(slimeAction.effect).not.toBe('stun');
  });

  it('applies stun attacks only to selected heavy/control enemies', () => {
    const groveBehemoth = createEnemyInstance('grove_behemoth');
    const behemothAction = groveBehemoth.ai(5);
    expect(behemothAction.type).toBe('stun');
    expect(behemothAction.effect).toBe('stun');

    const sepulcherArbiter = createEnemyInstance('sepulcher_arbiter');
    const arbiterAction = sepulcherArbiter.ai(4);
    expect(arbiterAction.type).toBe('stun');
    expect(arbiterAction.effect).toBe('stun');

    const clockworkEmperor = createEnemyInstance('clockwork_emperor');
    const emperorAction = clockworkEmperor.ai(5);
    expect(emperorAction.effect).not.toBe('stun');
  });

  it('keeps existing special-pattern cadence with new combo and stun rules', () => {
    const hushEnforcer = createEnemyInstance('hush_enforcer');
    const hushSpecial = hushEnforcer.ai(3);
    const hushCombo = hushEnforcer.ai(4);

    expect(hushSpecial.type).toBe('mini_special');
    expect(hushCombo.type).toBe('double');
    expect(hushCombo.multi).toBe(2);

    const memorySovereign = createEnemyInstance('memory_sovereign');
    const sovereignSpecial = memorySovereign.ai(3);
    const sovereignStun = memorySovereign.ai(5);

    expect(sovereignSpecial.type).toBe('boss_special');
    expect(sovereignStun.type).toBe('stun');
    expect(sovereignStun.effect).toBe('stun');
  });
});
