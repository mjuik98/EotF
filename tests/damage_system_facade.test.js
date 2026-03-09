import { describe, expect, it, vi } from 'vitest';
import { DamageSystem } from '../game/combat/damage_system.js';
import { Actions } from '../game/core/state_actions.js';

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
        return {
          duration: payload.duration,
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
});
