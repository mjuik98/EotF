'use strict';

export const MAP_NODE_TYPE_VISUAL_FALLBACK = Object.freeze({
  combat: Object.freeze({ color: '#ff3366', icon: 'C' }),
  elite: Object.freeze({ color: '#f0b429', icon: 'E' }),
  mini_boss: Object.freeze({ color: '#ff6600', icon: 'M' }),
  boss: Object.freeze({ color: '#7b2fff', icon: 'B' }),
  event: Object.freeze({ color: '#00ffcc', icon: '?' }),
  shop: Object.freeze({ color: '#f0b429', icon: '$' }),
  rest: Object.freeze({ color: '#44ff88', icon: '+' }),
});

export const MAP_NODE_TYPE_ORDER = Object.freeze([
  'combat',
  'elite',
  'mini_boss',
  'boss',
  'event',
  'shop',
  'rest',
]);

export const MAP_COMBAT_NODE_TYPES = Object.freeze([
  'combat',
  'elite',
  'mini_boss',
  'boss',
]);

// Weighted random pool used during regular floor node generation.
export const MAP_RANDOM_NODE_TYPE_POOL = Object.freeze([
  'combat',
  'combat',
  'combat',
  'event',
  'shop',
  'rest',
]);
