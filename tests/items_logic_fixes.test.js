import { describe, expect, it, vi } from 'vitest';
import { ITEMS } from '../data/items.js';
import { Trigger } from '../game/data/triggers.js';

describe('item logic fixes', () => {
    it('echo_gauntlet triggers on CHAIN_REACH_5 and does not reset chain', () => {
        const gs = {
            player: { echoChain: 5 },
            combat: { enemies: [{ hp: 12 }] },
            applyEnemyStatus: vi.fn(),
            addLog: vi.fn(),
        };

        ITEMS.echo_gauntlet.passive(gs, Trigger.CHAIN_REACH_5, { chain: 5 });

        expect(gs.applyEnemyStatus).toHaveBeenCalledWith('stunned', 1, 0);
        expect(gs.player.echoChain).toBe(5);
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

    it('void_eye applies weaken only for attack card plays', () => {
        const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.1);
        const gs = {
            combat: { enemies: [{ hp: 20 }] },
            applyEnemyStatus: vi.fn(),
            addLog: vi.fn(),
        };

        ITEMS.void_eye.passive(gs, Trigger.CARD_PLAY, { cardId: 'defend', cost: 1 });
        ITEMS.void_eye.passive(gs, Trigger.CARD_PLAY, { cardId: 'strike', cost: 1 });

        expect(gs.applyEnemyStatus).toHaveBeenCalledTimes(1);
        expect(gs.applyEnemyStatus).toHaveBeenCalledWith('weakened', 1, 0);
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
});
