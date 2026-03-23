import { afterEach, describe, expect, it, vi } from 'vitest';

import { PlayerReducers } from '../game/core/state_reducers/player_reducers.js';
import { Actions } from '../game/core/state_action_types.js';
import { applySetBonusDamageRules } from '../game/shared/progression/set_bonus_damage_rules.js';
import { applyPassiveSetBonuses } from '../game/shared/progression/set_bonus_passive_effects.js';
import { applySetBonusResourceRules } from '../game/shared/progression/set_bonus_resource_rules.js';

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

    applyPassiveSetBonuses(gs, { void_set: 2, echo_set: 2, blood_set: 2 });
    applyPassiveSetBonuses(gs, { void_set: 2, echo_set: 2, blood_set: 2 });

    expect(player.maxEcho).toBe(60);
    expect(player.maxHp).toBe(140);
    expect(player.hp).toBe(100);
    expect(gs._echoSet2).toBe(true);
    expect(dirty).toEqual(['hud']);
  });

  it('grants judgement energy every third played card and sanctuary bonuses on matching triggers', () => {
    const { gs, logs, player, shields } = createGameState({
      player: {
        hp: 95,
        maxHp: 100,
        maxEnergy: 5,
        energy: 1,
        statusEffects: { poison: 2, weak: 1 },
      },
    });
    vi.spyOn(Math, 'random').mockReturnValue(0);

    applySetBonusDamageRules(gs, { judgement: 3 }, 'card_play');
    applySetBonusDamageRules(gs, { judgement: 3 }, 'card_play');
    applySetBonusDamageRules(gs, { judgement: 3 }, 'card_play');
    applySetBonusDamageRules(gs, { sanctuary: 2 }, 'combat_start');
    applySetBonusDamageRules(gs, { sanctuary: 2 }, 'combat_start');
    applySetBonusDamageRules(gs, { sanctuary: 3 }, 'heal_amount', 10);
    applySetBonusDamageRules(gs, { sanctuary: 5 }, 'turn_start');

    expect(player.energy).toBe(2);
    expect(player.maxHp).toBe(110);
    expect(player.hp).toBe(110);
    expect(gs._sanctuarySet2Applied).toBe(true);
    expect(gs._sanctuarySet2Bonus).toBe(10);
    expect(shields.map(({ amount }) => amount)).toEqual([5]);
    expect(player.statusEffects.poison).toBe(0);
    expect(logs.some(({ message }) => message.includes('에너지 회복'))).toBe(true);
    expect(logs.some(({ message }) => message.includes('poison 제거'))).toBe(true);
  });

  it('scales shadow venom poison damage, draw rewards, and shield gain', () => {
    const { gs, draws, player, shields } = createGameState();
    gs._lastKillByPoison = true;

    const numeric = applySetBonusDamageRules(gs, { shadow_venom: 5 }, 'poison_damage', 4);
    const objectPayload = applySetBonusDamageRules(gs, { shadow_venom: 5 }, 'poison_damage', { amount: 6, id: 'tick' });
    applySetBonusDamageRules(gs, { shadow_venom: 3 }, 'enemy_kill');

    expect(numeric).toBe(6);
    expect(objectPayload).toEqual({ amount: 8, id: 'tick' });
    expect(draws).toHaveLength(1);
    expect(shields).toEqual([]);
    expect(player.shield).toBe(0);
  });

  it('applies resource triggers across void, machine, storm, and moon sets', () => {
    const { gs, echoes, logs, player } = createGameState({
      player: { hp: 9, maxHp: 30, shield: 15, echoChain: 3, exhausted: ['a', 'b', 'c'] },
    });

    expect(applySetBonusResourceRules(gs, { void_set: 3 }, 'deal_damage', 20)).toBe(23);
    applySetBonusResourceRules(gs, { void_set: 3 }, 'turn_start');
    expect(applySetBonusResourceRules(gs, { storm_set: 3 }, 'deal_damage', 10)).toBe(11);

    for (let i = 0; i < 5; i += 1) {
      applySetBonusResourceRules(gs, { machine_set: 2 }, 'card_exhaust');
    }
    applySetBonusResourceRules(gs, { machine_set: 3 }, 'turn_start');

    expect(player.energy).toBe(5);
    expect(gs._machineSet2EnergyUsed).toBe(4);
    expect(gs._machineSet3DamageBonus).toBe(15);
    expect(applySetBonusResourceRules(gs, { machine_set: 3 }, 'deal_damage', 10)).toBe(25);

    const blockFatal = applySetBonusResourceRules(gs, { moon_set: 5 }, 'damage_taken', 9);
    const preventDamage = vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const negateDamage = applySetBonusResourceRules(gs, { blood_set: 3 }, 'damage_taken', 5);
    preventDamage.mockRestore();

    expect(blockFatal).toBe(true);
    expect(player.hp).toBe(20);
    expect(negateDamage).toBe(true);
    expect(echoes).toEqual([{ amount: 15, source: { name: '심연의 삼위일체 세트(3)', type: 'set' } }]);
    expect(logs.some(({ message }) => message.includes('피해 무효'))).toBe(true);
  });
});
