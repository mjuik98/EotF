import { describe, expect, it, vi } from 'vitest';
import { ClassProgressionSystem } from '../game/systems/class_progression_system.js';

function createMeta(levelByClass = {}) {
  const xpByLevel = {
    1: 0,
    8: 1120,
    10: 1620,
  };
  const levels = {};
  const xp = {};
  Object.entries(levelByClass).forEach(([classId, level]) => {
    const lv = Number(level) || 1;
    levels[classId] = lv;
    xp[classId] = xpByLevel[lv] ?? 0;
  });
  return {
    runConfig: { ascension: 0 },
    codex: { cards: { add: vi.fn() } },
    classProgress: {
      levels,
      xp,
      pendingSummaries: [],
    },
  };
}

describe('ClassProgressionSystem mastery bonuses', () => {
  it('applies run-start permanent bonuses and starter upgrades once', () => {
    const gs = {
      meta: createMeta({ swordsman: 10 }),
      player: {
        class: 'swordsman',
        hp: 80,
        maxHp: 80,
        gold: 10,
        energy: 3,
        maxEnergy: 3,
        deck: ['strike', 'defend', 'foot_step'],
        buffs: {},
      },
    };
    const data = {
      startDecks: {
        swordsman: ['strike', 'defend', 'foot_step'],
      },
      cards: {
        strike: { type: 'attack' },
        defend: { type: 'skill' },
        foot_step: { type: 'attack' },
      },
      upgradeMap: {
        strike: 'strike_plus',
        defend: 'defend_plus',
        foot_step: 'foot_step_plus',
      },
    };

    const rand = vi.spyOn(Math, 'random').mockReturnValue(0);
    try {
      ClassProgressionSystem.applyRunStartBonuses(gs, {
        classIds: ['swordsman'],
        data,
        maxEnergyCap: 5,
      });
      ClassProgressionSystem.applyRunStartBonuses(gs, {
        classIds: ['swordsman'],
        data,
        maxEnergyCap: 5,
      });
    } finally {
      rand.mockRestore();
    }

    expect(gs.player.maxHp).toBe(100);
    expect(gs.player.hp).toBe(100);
    expect(gs.player.gold).toBe(60);
    expect(gs.player.maxEnergy).toBe(4);
    expect(gs.player.energy).toBe(4);
    expect(gs.player.deck).toEqual(['strike_plus', 'defend_plus', 'foot_step']);
    expect(gs.meta.codex.cards.has('strike')).toBe(true);
    expect(gs.meta.codex.cards.has('defend')).toBe(true);
    expect(gs.player._classMasteryRelicChoiceBonus).toBe(1);
    expect(gs.player._classMasteryOpeningDrawBonus).toBe(1);
  });

  it('applies combat-start and deck-ready mastery effects', () => {
    const gs = {
      meta: createMeta({ mage: 10 }),
      player: {
        class: 'mage',
        hp: 40,
        maxHp: 50,
        shield: 0,
        hand: ['strike', 'defend'],
        buffs: {},
        _traitCardDiscounts: {},
      },
      addShield: vi.fn((amount) => { gs.player.shield += amount; }),
      heal: vi.fn((amount) => {
        gs.player.hp = Math.min(gs.player.maxHp, gs.player.hp + amount);
      }),
      getBuff: vi.fn((id) => gs.player.buffs[id] || null),
      addBuff: vi.fn((id, stacks, data = {}) => {
        gs.player.buffs[id] = { stacks, ...data };
      }),
      addLog: vi.fn(),
    };

    ClassProgressionSystem.applyCombatStartBonuses(gs, { classIds: ['mage'] });
    expect(gs.player.shield).toBe(10);
    expect(gs.player._classMasteryMageOpeningDiscountPending).toBe(1);

    const rand = vi.spyOn(Math, 'random').mockReturnValue(0);
    try {
      ClassProgressionSystem.applyDeckReadyBonuses(gs, {
        classIds: ['mage'],
        data: {
          cards: {
            strike: { cost: 1, name: 'Strike' },
            defend: { cost: 1, name: 'Defend' },
          },
        },
      });
    } finally {
      rand.mockRestore();
    }

    expect(gs.player._traitCardDiscounts.strike).toBe(1);
    expect(gs.player._classMasteryMageOpeningDiscountPending).toBe(0);
  });

  it('exposes reward relic choice bonus from mastery level', () => {
    const gs = {
      meta: createMeta({ hunter: 8 }),
      player: { class: 'hunter' },
    };
    const bonus = ClassProgressionSystem.getRewardRelicChoiceBonus(gs, { classIds: ['hunter'] });
    expect(bonus).toBe(1);
  });

  it('applies deck-ready discounts from explicit cards input without global data', () => {
    const gs = {
      meta: createMeta({ mage: 10 }),
      player: {
        class: 'mage',
        hand: ['strike'],
        _traitCardDiscounts: {},
      },
      addLog: vi.fn(),
    };

    ClassProgressionSystem.applyCombatStartBonuses(gs, { classIds: ['mage'] });

    const rand = vi.spyOn(Math, 'random').mockReturnValue(0);
    try {
      ClassProgressionSystem.applyDeckReadyBonuses(gs, {
        classIds: ['mage'],
        cards: {
          strike: { cost: 1, name: 'Strike' },
        },
      });
    } finally {
      rand.mockRestore();
    }

    expect(gs.player._traitCardDiscounts.strike).toBe(1);
    expect(gs.player._classMasteryMageOpeningDiscountPending).toBe(0);
  });
});
