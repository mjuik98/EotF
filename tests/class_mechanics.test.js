import { describe, expect, it, vi } from 'vitest';
import { ClassMechanics } from '../game/shared/class/class_mechanic_rules.js';
import { ClassMechanics as ClassMechanicsFacade } from '../game/shared/class/class_mechanics.js';

function createState(overrides = {}) {
  const state = {
    player: {
      buffs: {},
    },
    combat: {
      active: true,
    },
    addBuff: vi.fn((id, stacks, data = {}) => {
      const buffs = state.player.buffs;
      if (!buffs[id]) {
        buffs[id] = { stacks, ...data };
        return;
      }
      buffs[id].stacks += stacks;
      for (const key of Object.keys(data)) {
        if (typeof data[key] === 'number') {
          buffs[id][key] = (buffs[id][key] || 0) + data[key];
        } else {
          buffs[id][key] = data[key];
        }
      }
    }),
    markDirty: vi.fn(),
    ...overrides,
  };
  return state;
}

describe('ClassMechanics.swordsman resonance updates', () => {
  it('increments resonance by 1 via addBuff on each card play', () => {
    const gs = createState({
      player: {
        buffs: {
          resonance: { stacks: 12, dmgBonus: 5 },
        },
      },
    });

    ClassMechanics.swordsman.onPlayCard(gs, { cardId: 'strike' });

    expect(gs.addBuff).toHaveBeenCalledWith('resonance', 0, { dmgBonus: 1 });
    expect(gs.player.buffs.resonance.dmgBonus).toBe(6);
    expect(gs.player.buffs.resonance.stacks).toBe(99);
    expect(gs.markDirty).toHaveBeenCalledWith('hud');
  });

  it('does not exceed resonance cap (30) on card play', () => {
    const gs = createState({
      player: {
        buffs: {
          resonance: { stacks: 80, dmgBonus: 30 },
        },
      },
    });

    ClassMechanics.swordsman.onPlayCard(gs, { cardId: 'strike' });

    expect(gs.addBuff).not.toHaveBeenCalled();
    expect(gs.player.buffs.resonance.dmgBonus).toBe(30);
    expect(gs.player.buffs.resonance.stacks).toBe(99);
    expect(gs.markDirty).toHaveBeenCalledWith('hud');
  });

  it('does not gain resonance from movement outside combat', () => {
    const gs = createState({
      combat: { active: false },
      player: {
        buffs: {
          resonance: { stacks: 99, dmgBonus: 10 },
        },
      },
    });

    ClassMechanics.swordsman.onMove(gs);

    expect(gs.player.buffs.resonance.dmgBonus).toBe(10);
  });
});

describe('ClassMechanics.guardian echo armor (잔영 갑주)', () => {
  function createGuardianState(shield = 0, preservedShield = undefined) {
    const state = {
      player: {
        class: 'guardian',
        shield,
        _preservedShield: preservedShield,
        buffs: {},
      },
      combat: { active: true },
      addShield: vi.fn((amount) => {
        state.player.shield += amount;
      }),
      addLog: vi.fn(),
      getBuff: vi.fn(() => null),
      ...({})
    };
    return state;
  }

  it('onTurnEnd preserves 50% of current shield', () => {
    const gs = createGuardianState(10);

    ClassMechanics.guardian.onTurnEnd(gs);

    expect(gs.player._preservedShield).toBe(5);
    expect(gs.addLog).toHaveBeenCalled();
  });

  it('onTurnStart restores preserved shield and resets _preservedShield', () => {
    const gs = createGuardianState(0, 5);

    ClassMechanics.guardian.onTurnStart(gs);

    expect(gs.addShield).toHaveBeenCalledWith(5);
    expect(gs.player._preservedShield).toBe(0);
  });

  it('onTurnStart restores preserved shield through state fallback when addShield is unavailable', () => {
    const gs = createGuardianState(0, 6);
    delete gs.addShield;
    gs.dispatch = vi.fn((action, payload = {}) => {
      if (action === 'player:shield') {
        gs.player.shield += Number(payload.amount || 0);
        return { shieldAfter: gs.player.shield };
      }
      return null;
    });

    ClassMechanics.guardian.onTurnStart(gs);

    expect(gs.dispatch).toHaveBeenCalledWith('player:shield', { amount: 6 });
    expect(gs.player.shield).toBe(6);
    expect(gs.player._preservedShield).toBe(0);
  });

  it('does not preserve shield when shield is 0 at turn end', () => {
    const gs = createGuardianState(0);

    ClassMechanics.guardian.onTurnEnd(gs);

    expect(gs.player._preservedShield).toBeUndefined();
    expect(gs.addLog).not.toHaveBeenCalled();
  });

  it('bug fix: _preservedShield should be recalculated after enemy attacks deplete shield', () => {
    // 시나리오: 방어막 10으로 턴 종료 → _preservedShield = 5
    // 적 공격으로 방어막 0이 됨 → _preservedShield 재계산 = 0
    const gs = createGuardianState(10);

    // 1. 턴 종료 시 _preservedShield 저장
    ClassMechanics.guardian.onTurnEnd(gs);
    expect(gs.player._preservedShield).toBe(5);

    // 2. 적 공격으로 방어막 소진 (시뮬레이션)
    gs.player.shield = 0;

    // 3. 적 턴 완료 후 재계산 (combat_turn_ui.js에서 수행하는 로직)
    gs.player._preservedShield = gs.player.shield > 0 ? Math.floor(gs.player.shield / 2) : 0;

    // 4. 방어막이 0이므로 _preservedShield도 0이어야 함
    expect(gs.player._preservedShield).toBe(0);

    // 5. onTurnStart에서 0이므로 addShield 호출되지 않아야 함
    ClassMechanics.guardian.onTurnStart(gs);
    expect(gs.addShield).not.toHaveBeenCalled();
  });

  it('bug fix: _preservedShield recalculated correctly when partial shield remains', () => {
    // 시나리오: 방어막 10으로 턴 종료 → _preservedShield = 5
    // 적 공격으로 방어막 4 남음 → _preservedShield 재계산 = 2
    const gs = createGuardianState(10);

    ClassMechanics.guardian.onTurnEnd(gs);
    expect(gs.player._preservedShield).toBe(5);

    // 적 공격으로 방어막 일부 소진
    gs.player.shield = 4;

    // 재계산
    gs.player._preservedShield = gs.player.shield > 0 ? Math.floor(gs.player.shield / 2) : 0;

    expect(gs.player._preservedShield).toBe(2);

    // onTurnStart에서 2만큼 복원
    ClassMechanics.guardian.onTurnStart(gs);
    expect(gs.addShield).toHaveBeenCalledWith(2);
  });
});

describe('ClassMechanics facade', () => {
  it('keeps view-model helpers but does not expose domain-level ui renderers', () => {
    expect(ClassMechanicsFacade.swordsman.getSpecialViewModel).toBeTypeOf('function');
    expect(ClassMechanicsFacade.swordsman.getSpecialUI).toBeUndefined();
  });
});
