'use strict';

export const RARITY_SORT_ORDER = Object.freeze({
  boss: 0,
  legendary: 1,
  special: 2,
  rare: 3,
  uncommon: 4,
  common: 5,
});

export const RARITY_LABELS = Object.freeze({
  common: '일반',
  uncommon: '비범',
  rare: '희귀',
  legendary: '전설',
  boss: '보스',
  special: '특수',
});

export const RARITY_TEXT_COLORS = Object.freeze({
  common: 'var(--text-dim)',
  uncommon: 'var(--echo-bright)',
  rare: 'var(--gold)',
  legendary: '#c084fc',
  boss: '#ff3366',
  special: '#44caf3',
});
