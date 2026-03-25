import { describe, expect, it, vi } from 'vitest';
import { ITEMS } from '../data/items.js';
import { CARDS } from '../data/cards.js';
import { Trigger } from '../game/data/triggers.js';
import { startPlayerTurnPolicy } from '../game/features/combat/domain/turn/start_player_turn_policy.js';
import { beginPlayerTurnState } from '../game/features/combat/state/player_turn_state_commands.js';
import { ItemSystem } from '../game/shared/progression/item_system.js';
import { SetBonusSystem } from '../game/shared/progression/set_bonus_system.js';
import { CardCostUtils } from '../game/utils/card_cost_utils.js';

function createTurnStartRuntime({
    items = [],
    drawPile = [],
    energy = 0,
    maxEnergy = 3,
    hp = 20,
    maxHp = 20,
} = {}) {
    return {
        currentRegion: 0,
        player: {
            items: [...items],
            buffs: {},
            deck: [...drawPile],
            drawPile: [...drawPile],
            hand: [],
            graveyard: [],
            exhausted: [],
            drawCount: 0,
            energy,
            maxEnergy,
            hp,
            maxHp,
            silenceGauge: 0,
        },
        combat: {
            active: true,
            playerTurn: false,
            turn: 0,
            enemies: [],
        },
        addLog: vi.fn(),
        markDirty: vi.fn(),
        drawCards(count) {
            for (let i = 0; i < count; i += 1) {
                if (!this.player.drawPile.length) break;
                this.player.hand.push(this.player.drawPile.pop());
            }
        },
        triggerItems(trigger, data) {
            return ItemSystem.triggerItems(this, trigger, data);
        },
    };
}

function runActualTurnStart(gs) {
    return startPlayerTurnPolicy(gs, {
        beginPlayerTurnState,
    });
}

describe('item logic fixes', () => {
    it('echo_gauntlet stuns a random alive enemy on CHAIN_REACH_5 and does not reset chain', () => {
        const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.99);
        const gs = {
            player: { echoChain: 5 },
            combat: { enemies: [{ hp: 12 }, { hp: 18 }, { hp: 0 }] },
            applyEnemyStatus: vi.fn(),
            addLog: vi.fn(),
        };

        ITEMS.echo_gauntlet.passive(gs, Trigger.CHAIN_REACH_5, { chain: 5 });

        expect(gs.applyEnemyStatus).toHaveBeenCalledWith('stunned', 1, 1);
        expect(gs.player.echoChain).toBe(5);
        randomSpy.mockRestore();
    });

    it('void_crown grants echo only when played card cost is 0', () => {
        const gs = {
            player: {},
            addEcho: vi.fn(),
        };

        ITEMS.void_crown.passive(gs, Trigger.CARD_PLAY, { cardId: 'strike', cost: 1 });
        ITEMS.void_crown.passive(gs, Trigger.CARD_PLAY, { cardId: 'resonance_plus', cost: 0 });

        expect(gs.addEcho).toHaveBeenCalledTimes(1);
        expect(gs.addEcho).toHaveBeenCalledWith(10, { name: '공허의 왕관', type: 'item' });
    });

    it('void_eye applies weaken only for attack card plays and uses explicit hit targets when provided', () => {
        const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.1);
        const gs = {
            combat: { enemies: [{ hp: 20 }, { hp: 18 }, { hp: 15 }] },
            applyEnemyStatus: vi.fn(),
            addLog: vi.fn(),
        };

        ITEMS.void_eye.passive(gs, Trigger.CARD_PLAY, { cardId: 'defend', cost: 1 });
        ITEMS.void_eye.passive(gs, Trigger.CARD_PLAY, { cardId: 'strike', cost: 1, targetIdxs: [0, 2, 2] });

        expect(gs.applyEnemyStatus).toHaveBeenCalledTimes(2);
        expect(gs.applyEnemyStatus).toHaveBeenNthCalledWith(1, 'weakened', 1, 0);
        expect(gs.applyEnemyStatus).toHaveBeenNthCalledWith(2, 'weakened', 1, 2);
        randomSpy.mockRestore();
    });

    it('dusk_mark applies extra weaken only when dealing damage to a weakened target', () => {
        const gs = {
            _selectedTarget: 0,
            combat: {
                enemies: [
                    { hp: 12, statusEffects: { weakened: 1 } },
                    { hp: 10, statusEffects: {} },
                ],
            },
            applyEnemyStatus: vi.fn(),
        };

        ITEMS.dusk_mark.passive(gs, Trigger.CARD_PLAY, { cardId: 'defend', cost: 1 });
        ITEMS.dusk_mark.passive(gs, Trigger.DEAL_DAMAGE, 7);

        expect(gs.applyEnemyStatus).toHaveBeenCalledTimes(1);
        expect(gs.applyEnemyStatus).toHaveBeenCalledWith('weakened', 1, 0, { name: '황혼의 낙인', type: 'item' });
    });
    it('paradox_contract does not permanently increase max energy when combat start triggers twice', () => {
        const relic = ITEMS.paradox_contract;
        const gs = {
            player: { maxEnergy: 3, energy: 3 },
        };

        relic.passive(gs, Trigger.COMBAT_START);
        relic.passive(gs, Trigger.COMBAT_START);
        expect(gs.player.maxEnergy).toBe(4);

        relic.passive(gs, Trigger.COMBAT_END);
        expect(gs.player.maxEnergy).toBe(3);
        expect(gs._paradoxActive).toBe(false);
        expect(gs._paradoxBaseMax).toBeUndefined();

        relic.passive(gs, Trigger.COMBAT_START);
        expect(gs.player.maxEnergy).toBe(4);
    });

    it('paradox_contract reverts max energy on death cleanup', () => {
        const relic = ITEMS.paradox_contract;
        const gs = {
            player: { maxEnergy: 3, energy: 5 },
        };

        relic.passive(gs, Trigger.COMBAT_START);
        relic.passive(gs, 'death');

        expect(gs.player.maxEnergy).toBe(3);
        expect(gs.player.energy).toBe(3);
        expect(gs._paradoxActive).toBe(false);
    });

    it('magnifying_glass lowers enemy attack intents through the live enemy ai path', () => {
        const gs = {
            player: { items: ['magnifying_glass'] },
            combat: {
                enemies: [{
                    hp: 20,
                    ai: () => ({ type: 'strike', intent: '공격 10', dmg: 10 }),
                }],
            },
        };

        ItemSystem.triggerItems(gs, Trigger.TURN_START);
        const action = gs.combat.enemies[0].ai(1);

        expect(action.dmg).toBe(9);
        expect(action.intent).toContain('9');
    });

    it('everlasting_oil discounts a card after the actual turn-start draw path populates the hand', () => {
        const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
        const gs = createTurnStartRuntime({
            items: ['everlasting_oil'],
            drawPile: ['strike'],
        });

        runActualTurnStart(gs);

        expect(gs.player.hand).toEqual(['strike']);
        expect(CardCostUtils.calcEffectiveCost('strike', CARDS.strike, gs.player, 0, {
            triggerItems: gs.triggerItems.bind(gs),
        })).toBe(0);
        randomSpy.mockRestore();
    });

    it('glitch_circuit applies both the zero-cost and surcharge effects to cards drawn on turn start', () => {
        const randomSpy = vi.spyOn(Math, 'random')
            .mockReturnValueOnce(0)
            .mockReturnValueOnce(0.999);
        const gs = createTurnStartRuntime({
            items: ['glitch_circuit'],
            drawPile: ['strike', 'defend'],
        });

        runActualTurnStart(gs);

        expect(gs.player.hand).toEqual(['defend', 'strike']);
        expect(CardCostUtils.calcEffectiveCost('defend', CARDS.defend, gs.player, 0, {
            triggerItems: gs.triggerItems.bind(gs),
        })).toBe(0);
        expect(CardCostUtils.calcEffectiveCost('strike', CARDS.strike, gs.player, 1, {
            triggerItems: gs.triggerItems.bind(gs),
        })).toBe(2);
        randomSpy.mockRestore();
    });

    it('eternity_core grants overcap energy on the actual turn-start runtime path', () => {
        const gs = createTurnStartRuntime({
            items: ['eternity_core'],
            drawPile: ['strike'],
            energy: 0,
            maxEnergy: 3,
        });

        runActualTurnStart(gs);

        expect(gs.player.energy).toBe(4);
    });

    it('mana_battery carries stored energy into the next turn above max energy', () => {
        const gs = createTurnStartRuntime({
            items: ['mana_battery'],
            drawPile: ['strike'],
            energy: 2,
            maxEnergy: 3,
        });

        ITEMS.mana_battery.passive(gs, Trigger.TURN_END);
        runActualTurnStart(gs);

        expect(gs.player.energy).toBe(5);
    });

    it('counts abyssal trinity relics toward the actual 심연의 삼위일체 set runtime', () => {
        const gs = {
            player: {
                items: ['abyssal_eye', 'abyssal_hand'],
            },
        };

        expect(SetBonusSystem.getOwnedSetCounts(gs).abyssal_set).toBe(2);
        expect(SetBonusSystem.getActiveSets(gs)).toEqual([
            expect.objectContaining({ key: 'abyssal_set', count: 2 }),
        ]);
    });

    it('keeps void trio on a separate 공허 set runtime', () => {
        const gs = {
            player: {
                items: ['void_eye', 'void_crown'],
            },
        };

        expect(SetBonusSystem.getOwnedSetCounts(gs).void_set).toBe(2);
        expect(SetBonusSystem.getOwnedSetCounts(gs).abyssal_set).toBe(0);
        expect(SetBonusSystem.getActiveSets(gs)).toEqual([
            expect.objectContaining({ key: 'void_set', count: 2 }),
        ]);
    });
});
