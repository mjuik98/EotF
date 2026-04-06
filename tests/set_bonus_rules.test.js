import { afterEach, describe, expect, it, vi } from 'vitest';

import { PlayerReducers } from '../game/core/state_reducers/player_reducers.js';
import { applyPassiveSetBonuses } from '../game/shared/progression/set_bonus_passive_effects.js';
import { applySetBonusResourceRules } from '../game/shared/progression/set_bonus_resource_rules.js';
import { applySetBonusSurvivalRules } from '../game/shared/progression/set_bonus_survival_rules.js';

function createGameState(overrides = {}) {
  const { player: playerOverrides = {}, ...gsOverrides } = overrides;
  const logs = [];
  const echoes = [];
  const shields = [];
  const heals = [];
  const draws = [];
  const dirty = [];
  const player = {
    hp: 90,
    maxHp: 100,
    energy: 1,
    maxEnergy: 5,
    shield: 0,
    maxEcho: 100,
    echoChain: 0,
    exhausted: [],
    statusEffects: {},
    ...playerOverrides,
  };
  const gs = {
    player,
    stats: { damageTaken: 0 },
    addLog(message, type) {
      logs.push({ message, type });
    },
    addEcho(amount, source) {
      echoes.push({ amount, source });
    },
    addShield(amount, source) {
      player.shield = (player.shield || 0) + amount;
      shields.push({ amount, source });
    },
    applyEnemyStatus(status, duration, targetIdx) {
      const enemy = this.combat?.enemies?.[targetIdx];
      if (!enemy) return;
      enemy.statusEffects = enemy.statusEffects || {};
      enemy.statusEffects[status] = (enemy.statusEffects[status] || 0) + duration;
    },
    heal(amount, source) {
      const healed = Math.min(amount, Math.max(0, player.maxHp - player.hp));
      player.hp += healed;
      heals.push({ amount: healed, source });
    },
    drawCards(amount, source) {
      draws.push({ amount, source });
    },
    markDirty(target) {
      dirty.push(target);
    },
    dispatch(action, payload) {
      const reducer = PlayerReducers[action];
      return reducer ? reducer(this, payload) : null;
    },
    ...gsOverrides,
  };

  return { gs, dirty, draws, echoes, heals, logs, player, shields };
}

describe('set bonus rules', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('applies passive bonuses once and marks shared flags', () => {
    const { gs, dirty, player } = createGameState({
      player: { hp: 80, maxHp: 120, maxEcho: 50 },
    });

    applyPassiveSetBonuses(gs, { abyssal_set: 2, ancient_set: 2 });
    applyPassiveSetBonuses(gs, { abyssal_set: 2, ancient_set: 2 });

    expect(player.maxEcho).toBe(60);
    expect(player.maxHp).toBe(130);
    expect(player.hp).toBe(90);
    expect(gs._ancientSet2Applied).toBe(true);
    expect(dirty).toEqual(['hud']);
  });

  it('applies resource triggers across abyssal, void, ancient, and machine sets', () => {
    const { gs, draws, echoes, logs, player } = createGameState({
      player: {
        hp: 9,
        maxHp: 30,
        shield: 15,
        echoChain: 3,
        exhausted: ['a', 'b', 'c'],
      },
    });
    gs.combat = {
      enemies: [{ hp: 20, statusEffects: { weakened: 1 } }],
    };

    expect(applySetBonusResourceRules(gs, { abyssal_set: 3 }, 'deal_damage', 20)).toBe(23);
    applySetBonusResourceRules(gs, { abyssal_set: 3 }, 'turn_start');
    applySetBonusResourceRules(gs, { void_set: 2 }, 'card_play', { cardId: 'flash', cost: 0 });
    applySetBonusResourceRules(gs, { ancient_set: 4 }, 'combat_start');

    for (let i = 0; i < 5; i += 1) {
      applySetBonusResourceRules(gs, { machine_set: 2 }, 'card_exhaust');
    }
    applySetBonusResourceRules(gs, { machine_set: 3 }, 'turn_start');

    expect(player.energy).toBe(5);
    expect(gs._machineSet2EnergyUsed).toBe(4);
    expect(gs._machineSet3DamageBonus).toBe(15);
    expect(applySetBonusResourceRules(gs, { machine_set: 3 }, 'deal_damage', 10)).toBe(25);
    expect(draws).toEqual([
      { amount: 1, source: { name: '고대인의 유산 세트(4)', type: 'set' } },
    ]);
    expect(echoes).toEqual([
      { amount: 15, source: { name: '심연의 삼위일체 세트(3)', type: 'set' } },
      { amount: 5, source: { name: '공허의 삼위일체 세트(2)', type: 'set' } },
    ]);
    expect(logs.some(({ message }) => message.includes('에너지 +1'))).toBe(true);
  });

  it('applies live survival triggers for void, ancient, serpents, grail, titan, and fortress sets', () => {
    const { gs, shields } = createGameState({
      player: { hp: 60, maxHp: 100 },
    });
    gs.combat = {
      enemies: [
        { hp: 30, statusEffects: { weakened: 1, poisoned: 10 } },
        { hp: 30, statusEffects: {} },
      ],
    };
    gs._selectedTarget = 0;
    vi.spyOn(Math, 'random').mockReturnValue(0);

    expect(applySetBonusSurvivalRules(gs, { void_set: 3 }, 'deal_damage', { amount: 20, targetIdx: 0 })).toEqual({
      amount: 23,
      targetIdx: 0,
    });
    expect(applySetBonusSurvivalRules(gs, { ancient_set: 5 }, 'deal_damage', 20)).toBe(26);
    expect(applySetBonusSurvivalRules(gs, { serpents_gaze: 3 }, 'deal_damage', { amount: 20, targetIdx: 0 })).toEqual({
      amount: 25,
      targetIdx: 0,
    });
    applySetBonusSurvivalRules(gs, { serpents_gaze: 2 }, 'poison_damage', { amount: 4, targetIdx: 0 });
    expect(gs.combat.enemies[1].statusEffects.poisoned).toBe(2);
    expect(applySetBonusSurvivalRules(gs, { holy_grail: 2 }, 'heal_amount', 50)).toBe(40);
    expect(shields).toEqual([{ amount: 10, source: { name: '생명의 성배 세트(2)', type: 'set' } }]);
    applySetBonusSurvivalRules(gs, { holy_grail: 3 }, 'heal_amount', 5);
    expect(applySetBonusSurvivalRules(gs, { holy_grail: 3 }, 'deal_damage', 10)).toBe(14);
    expect(applySetBonusSurvivalRules(gs, { titans_endurance: 2 }, 'deal_damage', 10)).toBe(undefined);
    gs.player.hp = 90;
    expect(applySetBonusSurvivalRules(gs, { titans_endurance: 2 }, 'deal_damage', 10)).toBe(15);
    gs.player.hp = 10;
    expect(applySetBonusSurvivalRules(gs, { titans_endurance: 3 }, 'damage_taken', 20)).toBe(true);
    expect(gs.player.hp).toBe(1);
    gs.player.shield = 50;
    expect(applySetBonusSurvivalRules(gs, { iron_fortress: 2 }, 'deal_damage', 10)).toBe(20);
    gs.player.energy = 1;
    applySetBonusSurvivalRules(gs, { iron_fortress: 5 }, 'turn_start');
    expect(gs.player.energy).toBe(2);
  });

  it('uses an injected randomFn for serpents_gaze poison transfer rolls', () => {
    const { gs } = createGameState({
      player: { hp: 60, maxHp: 100 },
    });
    const randomFn = vi.fn()
      .mockReturnValueOnce(0.05)
      .mockReturnValueOnce(0.99);
    gs.combat = {
      enemies: [
        { hp: 30, statusEffects: {} },
        { hp: 30, statusEffects: {} },
      ],
    };

    applySetBonusSurvivalRules(gs, { serpents_gaze: 2 }, 'poison_damage', { amount: 4, targetIdx: 0 }, { randomFn });

    expect(randomFn).toHaveBeenCalledTimes(2);
    expect(gs.combat.enemies[1].statusEffects.poisoned).toBe(2);
  });
});
