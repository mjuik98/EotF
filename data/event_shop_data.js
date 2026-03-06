'use strict';

export const ITEM_SHOP_RARITY_BASE_COSTS = Object.freeze({
  common: Object.freeze({ baseCost: 25 }),
  uncommon: Object.freeze({ baseCost: 50 }),
  rare: Object.freeze({ baseCost: 85 }),
  legendary: Object.freeze({ baseCost: 150 }),
});

export const ITEM_SHOP_RARITY_ORDER = Object.freeze([
  'common',
  'uncommon',
  'rare',
  'legendary',
]);
