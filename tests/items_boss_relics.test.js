import { describe, expect, it, vi } from 'vitest';
import { ITEMS } from '../data/items.js';
import { Trigger } from '../game/data/triggers.js';

describe('boss relic integration guards', () => {
    it('boss_soul_mirror applies max HP penalty once and revive once per combat', () => {
        const relic = ITEMS.boss_soul_mirror;
        const gs = { player: { maxHp: 100, hp: 100 } };

        relic.passive(gs, Trigger.COMBAT_START);
        expect(gs.player.maxHp).toBe(85);
        expect(gs.player.hp).toBe(85);

        relic.passive(gs, Trigger.COMBAT_END);
        relic.passive(gs, Trigger.COMBAT_START);
        expect(gs.player.maxHp).toBe(85);

        expect(relic.passive(gs, Trigger.PRE_DEATH)).toBe(true);
        expect(gs.player.hp).toBe(85);
        expect(relic.passive(gs, Trigger.PRE_DEATH)).toBeUndefined();

        relic.passive(gs, Trigger.COMBAT_END);
        relic.passive(gs, Trigger.COMBAT_START);
        expect(relic.passive(gs, Trigger.PRE_DEATH)).toBe(true);
    });

    it('boss_black_lotus keeps its hand-cap penalty across combat end once acquired', () => {
        const relic = ITEMS.boss_black_lotus;
        const gs = {
            player: { _handCapMinus: 2 },
            drawCards: vi.fn()
        };

        relic.onAcquire(gs);
        expect(gs.player._handCapMinus).toBe(3);

        relic.passive(gs, Trigger.COMBAT_START);
        expect(gs.player._handCapMinus).toBe(3);

        for (let i = 0; i < 5; i++) relic.passive(gs, Trigger.CARD_PLAY);
        expect(gs.drawCards).toHaveBeenCalledWith(2, { name: '흑연꽃', type: 'item' });

        relic.passive(gs, Trigger.COMBAT_END);
        expect(gs.player._handCapMinus).toBe(3);
    });

    it('boss_black_lotus applies its hand-cap penalty on acquire so opening hand limits are already reduced', () => {
        const relic = ITEMS.boss_black_lotus;
        const gs = {
            player: { _handCapMinus: 0 },
        };

        relic.onAcquire(gs);
        expect(gs.player._handCapMinus).toBe(1);

        relic.passive(gs, Trigger.COMBAT_START);
        relic.passive(gs, Trigger.COMBAT_END);

        expect(gs.player._handCapMinus).toBe(1);
    });
});
