import { describe, expect, it, vi } from 'vitest';
import { Actions, Reducers } from '../game/core/state_actions.js';

function createBaseState() {
    return {
        player: {
            hp: 30, maxHp: 30, shield: 0, gold: 0, energy: 3, maxEcho: 100, echo: 0,
            buffs: {}, deck: [], hand: [], graveyard: [], exhausted: [], drawPile: []
        },
        combat: { active: false, enemies: [], playerTurn: true, turn: 0, log: [] },
        stats: { damageTaken: 0, damageDealt: 0 },
        markDirty() { },
        addLog() { },
        triggerItems: vi.fn((trigger, data) => data)
    };
}

describe('New Relic Triggers', () => {
    it('CARD_DRAW should trigger items for each card drawn', () => {
        const gs = createBaseState();
        gs.player.drawPile = ['card1', 'card2'];

        Reducers[Actions.CARD_DRAW](gs, { count: 2 });

        expect(gs.triggerItems).toHaveBeenCalledWith('card_draw', { cardId: 'card2' });
        expect(gs.triggerItems).toHaveBeenCalledWith('card_draw', { cardId: 'card1' });
        expect(gs.triggerItems).toHaveBeenCalledTimes(2);
    });

    it('CARD_DISCARD with exhaust:true should trigger card_exhaust', () => {
        const gs = createBaseState();
        gs.player.hand = ['card1'];

        Reducers[Actions.CARD_DISCARD](gs, { cardId: 'card1', exhaust: true });

        expect(gs.triggerItems).toHaveBeenCalledWith('card_exhaust', { cardId: 'card1' });
        expect(gs.player.exhausted).toContain('card1');
    });

    it('PLAYER_ENERGY with positive amount should trigger energy_gain', () => {
        const gs = createBaseState();

        Reducers[Actions.PLAYER_ENERGY](gs, { amount: 2 });

        expect(gs.triggerItems).toHaveBeenCalledWith('energy_gain', { amount: 2 });
        expect(gs.player.energy).toBe(5);
    });

    it('PLAYER_ENERGY with negative amount should NOT trigger energy_gain', () => {
        const gs = createBaseState();

        Reducers[Actions.PLAYER_ENERGY](gs, { amount: -1 });

        expect(gs.triggerItems).not.toHaveBeenCalledWith('energy_gain', expect.anything());
        expect(gs.player.energy).toBe(2);
    });
});
