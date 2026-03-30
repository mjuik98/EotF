import { describe, expect, it, vi } from 'vitest';
import { DamageSystem } from '../game/features/combat/public.js';
import { Actions } from '../game/core/state_actions.js';
import { applyEnemyAreaDamageRuntime } from '../game/features/combat/application/public_combat_command_actions.js';
import { ItemSystem } from '../game/shared/progression/item_system.js';

function createHost() {
  const host = {
    player: {
      hp: 40,
      maxHp: 50,
      shield: 0,
      buffs: {},
      echoChain: 0,
    },
    combat: {
      enemies: [],
      turn: 1,
    },
    stats: {
      damageDealt: 0,
    },
    addEcho: vi.fn(),
    addLog: vi.fn(),
    markDirty: vi.fn(),
    heal: vi.fn(),
    onEnemyDeath: vi.fn(),
    dispatch: vi.fn((action, payload) => {
      if (action === Actions.ENEMY_DAMAGE) {
        const enemy = host.combat.enemies[payload.targetIdx];
        enemy.hp = Math.max(0, enemy.hp - payload.amount);
        host.stats.damageDealt += payload.amount;
        return {
          actualDamage: payload.amount,
          totalDamage: payload.amount,
          shieldAbsorbed: 0,
          hpAfter: enemy.hp,
          isDead: enemy.hp <= 0,
          targetIdx: payload.targetIdx,
        };
      }
      if (action === Actions.ENEMY_STATUS) {
        const enemy = host.combat.enemies[payload.targetIdx];
        enemy.statusEffects ??= {};
        if (payload.status === 'poisoned') {
          enemy.statusEffects.poisoned = (enemy.statusEffects.poisoned || 0) + payload.duration;
          enemy.statusEffects.poisonDuration = 3;
          return {
            duration: enemy.statusEffects.poisoned,
            poisonDuration: enemy.statusEffects.poisonDuration,
          };
        }
        enemy.statusEffects[payload.status] = (enemy.statusEffects[payload.status] || 0) + payload.duration;
        return {
          duration: enemy.statusEffects[payload.status],
        };
      }
      if (action === Actions.PLAYER_DAMAGE) {
        const shieldAbsorbed = Math.min(host.player.shield || 0, payload.amount);
        host.player.shield = Math.max(0, (host.player.shield || 0) - shieldAbsorbed);
        const actualDamage = Math.max(0, payload.amount - shieldAbsorbed);
        host.player.hp = Math.max(0, host.player.hp - actualDamage);
        return {
          shieldAbsorbed,
          actualDamage,
          isDead: host.player.hp <= 0,
        };
      }
      return {};
    }),
    getBuff(id) {
      return this.player.buffs[id] || null;
    },
    triggerItems: vi.fn(),
  };

  Object.assign(host, DamageSystem);
  return host;
}

describe('DamageSystem facade', () => {
  it('applies area damage through the runtime entrypoint without requiring gs.dealDamage to exist', () => {
    const deps = {
      doc: {
        getElementById: () => null,
        querySelectorAll: () => [],
      },
      win: {},
    };
    const gs = {
      player: {
        hp: 40,
        maxHp: 50,
        shield: 0,
        buffs: {},
        echoChain: 0,
      },
      combat: {
        enemies: [
          { id: 'slime_a', name: 'Slime A', hp: 5, shield: 0, statusEffects: {} },
          { id: 'slime_b', name: 'Slime B', hp: 8, shield: 0, statusEffects: {} },
        ],
        turn: 1,
      },
      stats: {
        damageDealt: 0,
      },
      worldMemory: {},
      meta: {
        codex: null,
      },
      addEcho: vi.fn(),
      addGold: vi.fn(),
      addLog: vi.fn(),
      markDirty: vi.fn(),
      dispatch: vi.fn((action, payload) => {
        if (action !== Actions.ENEMY_DAMAGE) return {};
        const enemy = gs.combat.enemies[payload.targetIdx];
        enemy.hp = Math.max(0, enemy.hp - payload.amount);
        gs.stats.damageDealt += payload.amount;
        return {
          actualDamage: payload.amount,
          totalDamage: payload.amount,
          shieldAbsorbed: 0,
          hpAfter: enemy.hp,
          isDead: enemy.hp <= 0,
          targetIdx: payload.targetIdx,
        };
      }),
      getBuff() {
        return null;
      },
      triggerItems: vi.fn(),
    };

    expect(() => applyEnemyAreaDamageRuntime(gs, { amount: 6, deps })).not.toThrow();
    expect(gs.combat.enemies[0].hp).toBe(0);
    expect(gs.combat.enemies[1].hp).toBe(2);
    expect(gs.addGold).toHaveBeenCalledTimes(1);
    expect(gs.addGold).toHaveBeenCalledWith(10, deps);
    expect(gs.addLog).toHaveBeenCalledWith('💀 Slime A 처치! +10골드', 'system');
  });

  it('calculatePotentialDamage does not consume single-use crit buffs', () => {
    const host = createHost();
    host.player.buffs.focus = { stacks: 1 };

    const damage = host.calculatePotentialDamage(10);

    expect(damage).toBe(20);
    expect(host.player.buffs.focus).toEqual({ stacks: 1 });
  });

  it('consumes focus before dodge but skips post-prevention triggers', () => {
    const host = createHost();
    host.player.buffs.focus = { stacks: 1 };
    host.combat.enemies = [{
      name: 'Shade',
      hp: 30,
      shield: 0,
      statusEffects: { dodge: 1 },
    }];

    const dealt = host.dealDamage(10, 0);

    expect(dealt).toBe(0);
    expect(host.player.buffs.focus).toBeUndefined();
    expect(host.combat.enemies[0].hp).toBe(30);
    expect(host._lastDodgedTarget).toBe(0);
    expect(host.triggerItems).not.toHaveBeenCalledWith('deal_damage', expect.anything());
    expect(host.triggerItems).not.toHaveBeenCalledWith('chain_dmg', expect.anything());
  });

  it('skips enemy status application on the target that just dodged', () => {
    const host = createHost();
    host._lastDodgedTarget = 0;
    host.combat.enemies = [{
      name: 'Shade',
      hp: 30,
      shield: 0,
      statusEffects: {},
    }];

    host.applyEnemyStatus('poisoned', 2, 0);

    expect(host.dispatch).not.toHaveBeenCalledWith(Actions.ENEMY_STATUS, expect.anything());
    expect(host._lastDodgedTarget).toBeNull();
  });

  it('attaches recent-feed metadata for card damage and shield results', () => {
    const host = createHost();
    host._currentCard = { id: 'strike', name: '강타' };
    host.combat.enemies = [{
      name: 'Shade',
      hp: 30,
      shield: 0,
      statusEffects: {},
    }];

    host.dealDamage(10, 0);
    host.addShield(6);

    expect(host.addLog).toHaveBeenNthCalledWith(1,
      '🃏 [강타] → Shade: 10 피해',
      'card-log',
      expect.objectContaining({
        recentFeed: {
          eligible: true,
          text: '[강타] -> Shade: 10 피해',
        },
      }));
    expect(host.addLog).toHaveBeenNthCalledWith(2,
      '🃏 [강타]: 방어막 +6',
      'buff',
      expect.objectContaining({
        recentFeed: {
          eligible: true,
          text: '[강타]: 방어막 +6',
        },
      }));
  });

  it('attaches recent-feed metadata for card-applied enemy status', () => {
    const host = createHost();
    host._currentCard = { id: 'poison_sting', name: '독침' };
    host.combat.enemies = [{
      name: 'Shade',
      hp: 30,
      shield: 0,
      statusEffects: {},
    }];

    host.applyEnemyStatus('poisoned', 2, 0);

    expect(host.addLog).toHaveBeenCalledWith(
      '💫 Shade: 중독 (2턴)',
      'echo',
      expect.objectContaining({
        recentFeed: {
          eligible: true,
          text: '[독침] -> Shade: 중독 2턴',
        },
      }),
    );
  });

  it('routes deal_damage target payloads so acidic_vial affects the actual damaged enemy', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const host = createHost();
    host._selectedTarget = 0;
    host.player.items = ['acidic_vial'];
    host.combat.enemies = [
      { name: 'Boss', hp: 30, shield: 0, statusEffects: { poisoned: 2 } },
      { name: 'Marked Add', hp: 30, shield: 0, statusEffects: { poisoned: 1 } },
    ];
    host.triggerItems = (trigger, payload) => ItemSystem.triggerItems(host, trigger, payload);

    host.dealDamage(5, 1);

    expect(host.combat.enemies[0].statusEffects.poisoned).toBe(2);
    expect(host.combat.enemies[1].statusEffects.poisoned).toBe(2);
    randomSpy.mockRestore();
  });

  it('refreshes poison duration through the live acidic_vial damage path', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const host = createHost();
    host.player.items = ['acidic_vial'];
    host.combat.enemies = [
      { name: 'Target', hp: 30, shield: 0, statusEffects: { poisoned: 1, poisonDuration: 1 } },
    ];
    host.triggerItems = (trigger, payload) => ItemSystem.triggerItems(host, trigger, payload);

    host.dealDamage(5, 0);

    expect(host.combat.enemies[0].statusEffects.poisoned).toBe(2);
    expect(host.combat.enemies[0].statusEffects.poisonDuration).toBe(3);
    randomSpy.mockRestore();
  });

  it('boosts god_slayer_blade only against the elite or boss target in mixed encounters', () => {
    const host = createHost();
    host.player.items = ['god_slayer_blade'];
    host.combat.enemies = [
      { name: 'Ancient Echo', hp: 50, shield: 0, statusEffects: {}, isBoss: true },
      { name: 'Minion', hp: 40, shield: 0, statusEffects: {} },
    ];
    host.triggerItems = (trigger, payload) => ItemSystem.triggerItems(host, trigger, payload);

    const minionDamage = host.dealDamage(10, 1);
    const bossDamage = host.dealDamage(10, 0);

    expect(minionDamage).toBe(10);
    expect(bossDamage).toBe(15);
  });

  it('uses the live item trigger path when predicting incoming enemy intent damage', () => {
    const host = createHost();
    host.player.items = ['magnifying_glass'];
    host.combat.turn = 2;
    host.combat.enemies = [
      { name: 'Watcher', hp: 30, shield: 0, statusEffects: {}, ai: () => ({ type: 'attack', intent: '공격 10', dmg: 10 }) },
    ];
    host.triggerItems = (trigger, payload) => ItemSystem.triggerItems(host, trigger, payload);

    expect(host.getEnemyIntent(0)).toBe(9);
  });
});
