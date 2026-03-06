import { describe, expect, it } from 'vitest';
import { EventManager } from '../game/systems/event_manager.js';
import { RunRules } from '../game/systems/run_rules.js';
import { ITEM_SHOP_RARITY_BASE_COSTS } from '../data/event_shop_data.js';

describe('Relic Price Verification', () => {
    it('calculates the correct base price for each rarity', () => {
        const gs = { runConfig: { ascension: 0, curse: 'none' } };

        expect(RunRules.getShopCost(gs, ITEM_SHOP_RARITY_BASE_COSTS.common.baseCost)).toBe(25);
        expect(RunRules.getShopCost(gs, ITEM_SHOP_RARITY_BASE_COSTS.uncommon.baseCost)).toBe(50);
        expect(RunRules.getShopCost(gs, ITEM_SHOP_RARITY_BASE_COSTS.rare.baseCost)).toBe(85);
        expect(RunRules.getShopCost(gs, ITEM_SHOP_RARITY_BASE_COSTS.legendary.baseCost)).toBe(150);
    });

    it('applies ascension modifiers correctly to the new base prices', () => {
        // getShopCost formula: base * (1 + ascension * 0.03)
        const gsLevel10 = { runConfig: { ascension: 10, curse: 'none' } };
        const multiplier = 1 + 10 * 0.03; // 1.3

        expect(RunRules.getShopCost(gsLevel10, ITEM_SHOP_RARITY_BASE_COSTS.common.baseCost)).toBe(Math.ceil(25 * 1.3));
        expect(RunRules.getShopCost(gsLevel10, ITEM_SHOP_RARITY_BASE_COSTS.uncommon.baseCost)).toBe(Math.ceil(50 * 1.3));
    });
});
