import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TurnManager } from '../game/features/combat/public.js';
import { ITEMS } from '../data/items.js';
import { Trigger } from '../game/data/triggers.js';
import { SetBonusSystem } from '../game/shared/progression/set_bonus_system.js';
import { enableLegacyPlayerStateCommandFallback } from '../game/platform/legacy/state/legacy_player_state_command_fallback.js';

function createGS() {
    const gs = enableLegacyPlayerStateCommandFallback({
        player: {
            hp: 50,
            maxHp: 100,
            shield: 0,
            energy: 3,
            maxEnergy: 3,
            items: [],
            buffs: {},
            echo: 0,
            hand: [],
            graveyard: [],
            exhausted: [],
        },
        combat: {
            active: true,
            enemies: [
                { id: 'e1', hp: 50, maxHp: 50, statusEffects: {} },
                { id: 'e2', hp: 50, maxHp: 50, statusEffects: {} }
            ],
            turn: 1,
            playerTurn: true,
            log: [],
        },
        _selectedTarget: 0,
        addLog: vi.fn(),
        markDirty: vi.fn(),
        dispatch: vi.fn(),

        dealDamage(dmg, targetIdx, noChain) {
            const enemy = this.combat.enemies[targetIdx];
            enemy.hp -= dmg;
        },

        addShield(amount, source) {
            let actual = amount;
            const scaled = this.triggerItems(Trigger.SHIELD_GAIN, actual);
            if (typeof scaled === 'number') actual = Math.floor(scaled);
            this.player.shield += actual;
        },

        heal(amount, source) {
            let actual = amount;
            const scaled = this.triggerItems(Trigger.HEAL_AMOUNT, actual);
            if (typeof scaled === 'number') actual = Math.floor(scaled);
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + actual);
        },

        applyEnemyStatus(status, duration, targetIdx) {
            const adjusted = this.triggerItems(Trigger.ENEMY_STATUS_APPLY, { status, duration, targetIdx });
            if (typeof adjusted === 'number') {
                duration = adjusted;
            }
            const enemy = this.combat.enemies[targetIdx];
            enemy.statusEffects[status] = (enemy.statusEffects[status] || 0) + duration;
            if (status === 'poisoned') {
                enemy.statusEffects.poisonDuration = 3;
            }
        },

        addEcho(amount) {
            this.player.echo += amount;
        },

        triggerItems(trigger, data) {
            let result = data;

            // Relic triggers
            this.player.items.forEach(itemId => {
                const item = ITEMS[itemId];
                if (item && item.passive) {
                    const res = item.passive(this, trigger, result);
                    if (res !== undefined) result = res;
                }
            });

            // Set bonus triggers
            const setResult = SetBonusSystem.triggerSetBonuses(this, trigger, result);
            if (setResult !== undefined) result = setResult;

            return result;
        }
    });
    return gs;
}

let gs;

describe('Thematic Relic Sets', () => {
    beforeEach(() => {
        gs = createGS();
    });

    describe('Serpents Gaze (독사의 시선)', () => {
        it('serpent_fang_dagger applies poison at combat start', () => {
            gs.player.items = ['serpent_fang_dagger'];
            gs.triggerItems(Trigger.COMBAT_START);
            const totalPoison = gs.combat.enemies.reduce((sum, e) => sum + (e.statusEffects.poisoned || 0), 0);
            expect(totalPoison).toBe(4);
        });

        it('acidic_vial has chance to increase poison on attack', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.1); // Success (20% chance)
            gs.player.items = ['acidic_vial'];
            gs.combat.enemies[0].statusEffects.poisoned = 1;
            gs.triggerItems(Trigger.DEAL_DAMAGE, 10);
            expect(gs.combat.enemies[0].statusEffects.poisoned).toBe(2);
            vi.spyOn(Math, 'random').mockRestore();
        });

        it('serpent 2-set bonus spreads poison', () => {
            gs._serpentSet2 = true;
            gs.combat.enemies[0].statusEffects.poisoned = 5;
            vi.spyOn(Math, 'random').mockReturnValue(0.05); // Success (10% chance)

            TurnManager.processEnemyStatusTicks(gs);

            // Enemy 1 gets poison spread, then poison ticks once (duration decreases, stacks remain).
            expect(gs.combat.enemies[1].statusEffects.poisoned).toBe(2);
            expect(gs.combat.enemies[1].statusEffects.poisonDuration).toBe(2);
            expect(gs.addLog).toHaveBeenCalled();
            vi.spyOn(Math, 'random').mockRestore();
        });

        it('serpent 3-set bonus increases damage against highly poisoned targets', () => {
            gs._serpentSet3 = true;
            gs.combat.enemies[0].statusEffects.poisoned = 10;
            gs._selectedTarget = 0;
            const dmg = gs.triggerItems(Trigger.DEAL_DAMAGE, 100);
            expect(dmg).toBe(125);
        });
    });

    describe('Holy Grail (생명의 성배)', () => {
        it('monks_rosary heals at turn start', () => {
            gs.player.items = ['monks_rosary'];
            gs.player.hp = 50;
            gs.triggerItems(Trigger.TURN_START);
            expect(gs.player.hp).toBe(53);
        });

        it('grail 2-set bonus converts overheal to shield', () => {
            gs._grailSet2 = true;
            gs.player.hp = 95; // 5 missing
            gs.heal(10); // 5 overheal
            expect(gs.player.hp).toBe(100);
            expect(gs.player.shield).toBe(5);
        });

        it('grail 3-set bonus boosts next damage after heal', () => {
            gs._grailSet3 = true;
            gs.heal(5);
            const dmg = gs.triggerItems(Trigger.DEAL_DAMAGE, 10);
            expect(dmg).toBe(14);
            // Verify consumption
            const nextDmg = gs.triggerItems(Trigger.DEAL_DAMAGE, 10);
            expect(nextDmg).toBe(10);
        });
    });

    describe('Titans Endurance (거인의 인내)', () => {
        it('titans_belt boosts max HP in combat', () => {
            gs.player.items = ['titans_belt'];
            gs.triggerItems(Trigger.COMBAT_START);
            expect(gs.player.maxHp).toBe(115);
            expect(gs.player.hp).toBe(65);

            gs.triggerItems(Trigger.COMBAT_END);
            expect(gs.player.maxHp).toBe(100);
            expect(gs.player.hp).toBe(65);
        });

        it('titan 2-set bonus boosts damage at high HP', () => {
            gs._titanSet2 = true;
            gs.player.hp = 90; // 90%
            const dmg = gs.triggerItems(Trigger.DEAL_DAMAGE, 10);
            expect(dmg).toBe(15);
        });

        it('titan 3-set bonus prevents death once', () => {
            gs._titanSet3 = true;
            gs.player.hp = 10;
            const res = gs.triggerItems(Trigger.DAMAGE_TAKEN, 20);
            expect(res).toBe(true); // Negated
            expect(gs.player.hp).toBe(1);
            expect(gs._titanUsed).toBe(true);
        });
    });

    describe('Iron Fortress (철옹성)', () => {
        it('bastion_shield_plate gives shield at turn end', () => {
            gs.player.items = ['bastion_shield_plate'];
            gs.triggerItems(Trigger.TURN_END);
            expect(gs.player.shield).toBe(5);
        });

        it('fortress 2-set bonus adds energy at turn start with shield', () => {
            gs._fortSet2 = true;
            gs.player.shield = 10;
            gs.player.energy = 1;
            vi.spyOn(Math, 'random').mockReturnValue(0.1); // Success (25% chance)
            gs.triggerItems(Trigger.TURN_START);
            expect(gs.player.energy).toBe(2);
            vi.spyOn(Math, 'random').mockRestore();
        });

        it('fortress 3-set bonus adds shield-based damage', () => {
            gs._fortSet3 = true;
            gs.player.shield = 50;
            const dmg = gs.triggerItems(Trigger.DEAL_DAMAGE, 10);
            expect(dmg).toBe(20); // 10 + (50 * 0.2)
        });
    });
});
