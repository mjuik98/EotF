'use strict';

export const ITEM_SHOP_RARITY_BASE_COSTS = Object.freeze({
  common: Object.freeze({ baseCost: 10 }),
  uncommon: Object.freeze({ baseCost: 20 }),
  rare: Object.freeze({ baseCost: 35 }),
  legendary: Object.freeze({ baseCost: 60 }),
});

export const ITEM_SHOP_RARITY_ORDER = Object.freeze([
  'common',
  'uncommon',
  'rare',
  'legendary',
]);
