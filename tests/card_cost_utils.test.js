import { describe, expect, it } from 'vitest';
import { CardCostUtils } from '../game/utils/card_cost_utils.js';

describe('CardCostUtils', () => {
    it('applies total discounts without going below zero', () => {
        const card = { cost: 3 };
        const player = {
            zeroCost: false,
            _cascadeCards: new Map(),
            _freeCardUses: 0,
            costDiscount: 1,
            _nextCardDiscount: 5,
        };

        expect(CardCostUtils.calcEffectiveCost('strike', card, player)).toBe(0);
    });

    it('treats cascade by hand index as free and consumes that entry only', () => {
        const cascade = new Map([[2, 'strike'], [4, 'defend']]);
        const player = {
            zeroCost: false,
            _cascadeCards: cascade,
            _freeCardUses: 0,
            costDiscount: 0,
            _nextCardDiscount: 0,
            energy: 0,
        };
        const card = { cost: 1 };

        expect(CardCostUtils.isCascadeFree('strike', player, 2)).toBe(true);
        expect(CardCostUtils.calcEffectiveCost('strike', card, player, 2)).toBe(0);

        CardCostUtils.consumeFreeCharge('strike', player, 2);
        expect(cascade.has(2)).toBe(false);
        expect(cascade.has(4)).toBe(true);
    });
});

