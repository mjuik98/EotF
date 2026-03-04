import { describe, expect, it, vi } from 'vitest';
import { Actions, Reducers } from '../game/core/state_actions.js';

function createBaseState() {
    const dirty = new Set();
    return {
        player: {
            hp: 30,
            maxHp: 30,
            shield: 0,
            gold: 0,
            energy: 3,
            maxEcho: 100,
            echo: 0,
            buffs: {},
            deck: [],
            hand: [],
            graveyard: [],
            exhausted: [],
        },
        combat: {
            active: false,
            enemies: [],
            playerTurn: true,
            turn: 0,
            log: [],
        },
        stats: {
            damageTaken: 0,
            damageDealt: 0,
        },
        markDirty(key) {
            dirty.add(key);
        },
        isDirty(key) {
            return dirty.has(key);
        },
        addLog() {},
    };
}

describe('Reducers', () => {
    it('PLAYER_DAMAGE consumes shield before HP', () => {
        const gs = createBaseState();
        gs.player.shield = 5;

        const result = Reducers[Actions.PLAYER_DAMAGE](gs, { amount: 8 });

        expect(result.shieldAbsorbed).toBe(5);
        expect(result.actualDamage).toBe(3);
        expect(gs.player.hp).toBe(27);
        expect(gs.player.shield).toBe(0);
        expect(gs.isDirty('hud')).toBe(true);
    });

    it('CARD_DRAW reshuffles graveyard into deck and draws up to hand limit', () => {
        const gs = createBaseState();
        gs.player.deck = [];
        gs.player.graveyard = ['a', 'b', 'c'];
        gs.player.hand = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7'];

        const result = Reducers[Actions.CARD_DRAW](gs, { count: 3 });

        expect(result.drawn).toBe(1);
        expect(gs.player.hand.length).toBe(8);
        expect(gs.player.graveyard.length).toBe(0);
        expect(gs.isDirty('hand')).toBe(true);
    });

    it('CARD_DISCARD dispatches correct item trigger by discard type', () => {
        const gs = createBaseState();
        gs.triggerItems = vi.fn();

        gs.player.hand = ['strike'];
        Reducers[Actions.CARD_DISCARD](gs, { cardId: 'strike', exhaust: false });
        expect(gs.player.graveyard).toContain('strike');
        expect(gs.triggerItems).toHaveBeenCalledWith('card_discard', { cardId: 'strike' });

        gs.player.hand = ['defend'];
        Reducers[Actions.CARD_DISCARD](gs, { cardId: 'defend', exhaust: true });
        expect(gs.player.exhausted).toContain('defend');
        expect(gs.triggerItems).toHaveBeenCalledWith('card_exhaust', { cardId: 'defend' });
    });
});
