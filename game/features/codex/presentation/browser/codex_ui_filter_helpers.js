import { DescriptionUtils } from '../../../ui/ports/public_text_support_capabilities.js';

import { getCodexSets } from './codex_ui_state_helpers.js';

export function highlightCodexDescription(desc) {
  if (!desc) return '';
  if (typeof DescriptionUtils?.highlight === 'function') return DescriptionUtils.highlight(desc);
  return desc;
}

export function getCardTypeLabel(type) {
  const value = String(type || '').toUpperCase();
  return value === 'ATTACK' ? '공격' : value === 'SKILL' ? '기술' : value === 'POWER' ? '능력' : (value || '기타');
}

export function getCardTypeClass(type) {
  const value = String(type || '').toUpperCase();
  return value === 'ATTACK' ? 'b-attack' : value === 'SKILL' ? 'b-skill' : value === 'POWER' ? 'b-power' : 'b-item';
}

export function getRarityLabel(rarity) {
  const map = { boss: '보스', legendary: '전설', rare: '희귀', uncommon: '비범', common: '일반' };
  return map[String(rarity || 'common').toLowerCase()] || '일반';
}

export function getRarityBadgeClass(rarity) {
  const map = { boss: 'b-boss', legendary: 'b-legendary', rare: 'b-rare', uncommon: 'b-skill', common: 'b-item' };
  return map[String(rarity || 'common').toLowerCase()] || 'b-item';
}

export function getEnemyTypeClass(enemy) {
  if (enemy.isBoss) return 't-boss';
  if (enemy.isMiniBoss) return 't-miniboss';
  if (enemy.isElite) return 't-elite';
  return 't-enemy';
}

export function getEnemyBadgeClass(enemy) {
  if (enemy.isBoss) return 'b-boss';
  if (enemy.isMiniBoss) return 'b-miniboss';
  if (enemy.isElite) return 'b-elite';
  return 'b-enemy';
}

export function getEnemyTypeLabel(enemy) {
  if (enemy.isBoss) return '보스';
  if (enemy.isMiniBoss) return '중간 보스';
  if (enemy.isElite) return '정예';
  return '일반';
}

export function getRarityCardClass(rarity) {
  const value = String(rarity || '').toLowerCase();
  if (value === 'legendary') return 'r-legendary';
  if (value === 'rare') return 'r-rare';
  return '';
}

export function getCodexFilterDefinitions(data) {
  const sets = getCodexSets(data);
  const setFilters = Object.entries(sets).map(([key, set]) => ({
    k: `set:${key}`, l: `◈ ${set.name}`, c: `f-set-${key}`,
  }));
  return {
    enemies: [
      { k: 'all', l: '전체' },
      { k: 'enemy', l: '일반', c: 'f-enemy' },
      { k: 'elite', l: '정예', c: 'f-elite' },
      { k: 'miniboss', l: '중간 보스', c: 'f-miniboss' },
      { k: 'boss', l: '보스', c: 'f-boss' },
    ],
    cards: [
      { k: 'all', l: '전체' },
      { k: 'attack', l: '공격', c: 'f-attack' },
      { k: 'skill', l: '기술', c: 'f-skill' },
      { k: 'power', l: '능력', c: 'f-power' },
    ],
    items: [
      { k: 'all', l: '전체' },
      { k: 'common', l: '일반' },
      { k: 'uncommon', l: '비범' },
      { k: 'rare', l: '희귀', c: 'f-rare' },
      { k: 'legendary', l: '전설', c: 'f-legendary' },
      { k: 'boss', l: '보스', c: 'f-boss' },
      ...(setFilters.length ? [null, ...setFilters] : []),
    ],
    inscriptions: [{ k: 'all', l: '전체' }],
  };
}

export function applyCodexFilter(entries, codex, category, options = {}) {
  const {
    search = '',
    filter = 'all',
    sort = 'default',
    showUnknown = true,
    getRecord = () => null,
  } = options;
  let output = entries.slice();

  if (search) {
    output = output.filter((entry) => (entry.name || '').toLowerCase().includes(search));
  }

  if (filter.startsWith('set:')) {
    const setKey = filter.slice(4);
    output = output.filter((entry) => entry.set === setKey);
  } else if (filter !== 'all') {
    output = output.filter((entry) => {
      if (category === 'enemies') {
        if (filter === 'boss') return !!entry.isBoss;
        if (filter === 'miniboss') return !!entry.isMiniBoss;
        if (filter === 'elite') return !!entry.isElite;
        if (filter === 'enemy') return !entry.isBoss && !entry.isElite && !entry.isMiniBoss;
        return false;
      }
      const type = String(entry.type || '').toLowerCase();
      const rarity = String(entry.rarity || '').toLowerCase();
      return type === filter || rarity === filter;
    });
  }

  if (!showUnknown) {
    const seenSet = codex[category] || new Set();
    output = output.filter((entry) => seenSet.has(entry.id));
  }

  const seenSet = codex[category] || new Set();
  if (sort === 'name') {
    output.sort((left, right) => {
      if (!seenSet.has(left.id) && !seenSet.has(right.id)) return 0;
      if (!seenSet.has(left.id)) return 1;
      if (!seenSet.has(right.id)) return -1;
      return (left.name || '').localeCompare(right.name || '', 'ko');
    });
  } else if (sort === 'rarity') {
    const order = { legendary: 0, boss: 1, rare: 2, uncommon: 3, common: 4 };
    output.sort((left, right) => {
      if (!seenSet.has(left.id) && !seenSet.has(right.id)) return 0;
      if (!seenSet.has(left.id)) return 1;
      if (!seenSet.has(right.id)) return -1;
      return (order[String(left.rarity || '').toLowerCase()] ?? 5) - (order[String(right.rarity || '').toLowerCase()] ?? 5);
    });
  } else if (sort === 'count') {
    output.sort((left, right) => {
      if (!seenSet.has(left.id) && !seenSet.has(right.id)) return 0;
      if (!seenSet.has(left.id)) return 1;
      if (!seenSet.has(right.id)) return -1;
      const leftRecord = getRecord(category, left.id);
      const rightRecord = getRecord(category, right.id);
      const leftValue = leftRecord ? (leftRecord.kills ?? leftRecord.used ?? leftRecord.found ?? 0) : 0;
      const rightValue = rightRecord ? (rightRecord.kills ?? rightRecord.used ?? rightRecord.found ?? 0) : 0;
      return rightValue - leftValue;
    });
  }

  return output;
}
