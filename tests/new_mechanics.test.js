import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DamageSystem } from '../game/combat/damage_system.js';
import { TurnManager } from '../game/combat/turn_manager.js';

// Mock browser globals
global.document = {
    createElement: () => ({ style: {}, appendChild: () => { }, querySelector: () => null }),
    body: { appendChild: () => { } },
    documentElement: { style: {} }
};
global.window = {
    addEventListener: () => { },
    removeEventListener: () => { },
    dispatchEvent: () => { },
    CustomEvent: class { },
    requestAnimationFrame: (cb) => setTimeout(cb, 0),
    cancelAnimationFrame: () => { },
    innerWidth: 1024,
    innerHeight: 768
};
global.AudioContext = class { };
global.fetch = vi.fn();

function createMockGameState() {
    const gs = {
        player: {
            hp: 50, maxHp: 100, buffs: {}, energy: 3, hand: [], graveyard: [], stats: { damageDealt: 0 },
            echoChain: 0
        },
        combat: { active: true, enemies: [], turn: 1 },
        addLog: vi.fn(),
        addEcho: vi.fn(),
        heal: function (amt) { this.player.hp = Math.min(this.player.maxHp, this.player.hp + amt); },
        takeDamage: function (amt) { this.player.hp -= amt; },
        markDirty: vi.fn(),
        getBuff: function (id) { return this.player.buffs[id]; },
        triggerItems: (type, val) => val,
        dispatch: vi.fn()
    };
    // Mixin DamageSystem methods
    Object.assign(gs, DamageSystem);
    return gs;
}

describe('New Card Mechanics', () => {

    describe('Critical Hits', () => {
        it('doubles damage with "focus" buff and consumes it', () => {
            const gs = createMockGameState();
            const enemy = { name: 'E1', hp: 50, maxHp: 50, statusEffects: {} };
            gs.combat.enemies = [enemy];
            gs.player.buffs.focus = { stacks: 1 };

            gs.dealDamage(10, 0);

            expect(enemy.hp).toBe(30); // 10 * 2 = 20 damage
            expect(gs.player.buffs.focus).toBeUndefined();
        });

        it('doubles damage for multiple hits with "critical_turn" and does NOT consume it', () => {
            const gs = createMockGameState();
            const enemy = { name: 'E1', hp: 100, maxHp: 100, statusEffects: {} };
            gs.combat.enemies = [enemy];
            gs.player.buffs.critical_turn = { stacks: 1 };

            gs.dealDamage(10, 0);
            expect(enemy.hp).toBe(80); // 10 * 2 = 20

            gs.dealDamage(5, 0);
            expect(enemy.hp).toBe(70); // 5 * 2 = 10

            expect(gs.player.buffs.critical_turn).toBeDefined();
        });
    });

    describe('Life Steal', () => {
        it('heals player based on damage dealt with "lifesteal" buff', () => {
            const gs = createMockGameState();
            const enemy = { name: 'E1', hp: 100, maxHp: 100, statusEffects: {} };
            gs.combat.enemies = [enemy];
            gs.player.hp = 50;
            gs.player.buffs.lifesteal = { stacks: 1, percent: 30 };

            gs.dealDamage(20, 0);

            // damage = 20. heal = 20 * 0.3 = 6.
            expect(gs.player.hp).toBe(56);
        });
    });

    describe('Reflection (Spike Shield)', () => {
        it('reflects damage back to enemy and does NOT consume buff', () => {
            const gs = createMockGameState();
            gs.player.buffs.spike_shield = { stacks: 1 };
            gs.onEnemyDeath = vi.fn();

            const enemy = { name: 'Reflect Target', hp: 50, maxHp: 50, statusEffects: {} };
            const action = { dmg: 10, intent: '공격' };

            TurnManager.processEnemyAttack(gs, enemy, 0, action);

            expect(enemy.hp).toBe(40); // 50 - 10
            expect(gs.player.buffs.spike_shield).toBeDefined();
        });
    });
});
