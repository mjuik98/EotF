'use strict';

export const RARITY_SORT_ORDER = Object.freeze({
  legendary: 0,
  rare: 1,
  uncommon: 2,
  common: 3,
});

export const RARITY_LABELS = Object.freeze({
  common: '일반',
  uncommon: '비범',
  rare: '희귀',
  legendary: '전설',
  boss: '보스',
});

export const RARITY_TEXT_COLORS = Object.freeze({
  common: 'var(--text-dim)',
  uncommon: 'var(--echo-bright)',
  rare: 'var(--gold)',
  legendary: '#c084fc',
  boss: '#ff3366',
});
