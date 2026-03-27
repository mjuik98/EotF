import { UNLOCKABLES } from './unlockable_definitions.js';
import { ACHIEVEMENTS } from './achievement_definitions.js';
import { getAchievementProgressValue } from './achievement_progress_queries.js';
import {
  getRunCardLabel,
  getRunCurseLabel,
  getRunRelicLabel,
} from '../../run/ports/public_content_capabilities.js';

function getDefinitionBucket(type) {
  return UNLOCKABLES?.[`${type}s`] || {};
}

function getUnlockBucket(meta, type) {
  return meta?.contentUnlocks?.[`${type}s`] || {};
}

function getCardUnlockBuckets(meta, classId) {
  const cards = meta?.contentUnlocks?.cards || {};
  const shared = cards.shared || {};
  if (!classId) return { shared, scoped: null };
  return {
    shared,
    scoped: cards[String(classId)] || {},
  };
}

function getRelicUnlockBuckets(meta, classId) {
  const shared = meta?.contentUnlocks?.relics || {};
  if (!classId) return { shared, scoped: null };
  return {
    shared,
    scoped: meta?.contentUnlocks?.relicsByClass?.[String(classId)] || {},
  };
}

function buildUnlockRoadmapEntry(meta, contentType, definition) {
  if (!definition?.id) return null;

  const classId = definition.scope === 'class'
    ? String(definition.classId || '')
    : '';

  if (isContentUnlocked(meta, {
    type: contentType,
    id: definition.id,
    ...(classId ? { classId } : {}),
  })) {
    return null;
  }

  const achievementId = Array.isArray(definition.requires) ? definition.requires[0] : null;
  const achievement = achievementId ? ACHIEVEMENTS?.[achievementId] : null;
  const target = Number(achievement?.condition?.count || 0);
  const progress = Math.min(target || 0, getAchievementProgressValue(meta, achievement?.condition));

  return {
    entry: {
      contentType,
      contentId: definition.id,
      contentLabel: getContentLabel({ type: contentType, id: definition.id, fallbackLabel: definition.displayName }),
      requirementLabel: definition.unlockHint || '해금 필요',
      progressLabel: target > 0 ? `${progress} / ${target}` : '',
      achievementTitle: achievement?.title || '',
      focusLabel: describeAchievementFocus(achievement?.condition),
    },
    progress,
    target,
    remaining: Math.max(0, target - progress),
  };
}

function describeAchievementFocus(condition = {}) {
  switch (condition?.type) {
    case 'victories':
      return '승리 런';
    case 'cursed_victories':
      return '저주 승리';
    case 'failures':
      return '실패 기록';
    case 'best_chain':
      return '연쇄 달성';
    case 'world_memory_count':
      return '세계 기억';
    case 'class_level':
      return '클래스 숙련';
    case 'boss_kills':
      return '보스 격파';
    case 'region_victories':
      return '지역 정복';
    case 'highest_ascension_victory':
      return '승천 승리';
    case 'story_pieces':
      return '스토리 조각';
    case 'codex_entries':
      return '도감 수집';
    case 'codex_enemies':
      return '적 도감';
    case 'codex_cards':
      return '카드 도감';
    case 'codex_items':
      return '유물 도감';
    default:
      return '';
  }
}

function sortRoadmapEntries(entries = []) {
  return [...entries].sort((left, right) => {
    if (left.remaining !== right.remaining) return left.remaining - right.remaining;
    return (left.order || 0) - (right.order || 0);
  });
}

export function isContentUnlocked(meta, { type, id, classId } = {}) {
  if (!type || !id) return false;
  if (type === 'card' && classId) {
    const { shared, scoped } = getCardUnlockBuckets(meta, classId);
    return !!shared?.[id]?.unlocked || !!scoped?.[id]?.unlocked;
  }
  if (type === 'card') {
    return !!getCardUnlockBuckets(meta).shared?.[id]?.unlocked;
  }
  if (type === 'relic' && classId) {
    const { shared, scoped } = getRelicUnlockBuckets(meta, classId);
    return !!shared?.[id]?.unlocked || !!scoped?.[id]?.unlocked;
  }
  return !!getUnlockBucket(meta, type)?.[id]?.unlocked;
}

export function isContentAvailable(meta, { type, id, classId } = {}) {
  if (!type || !id) return false;
  const definition = getDefinitionBucket(type)?.[id];
  if (!definition) return true;

  const scopedClassId = definition.scope === 'class'
    ? String(definition.classId || '')
    : String(classId || '');

  if (definition.scope === 'class') {
    if (!scopedClassId) return false;
    if (classId && String(classId) !== scopedClassId) return false;
  }

  return isContentUnlocked(meta, {
    type,
    id,
    ...(scopedClassId ? { classId: scopedClassId } : {}),
  });
}

export function getContentVisibility(meta, { type, id, classId } = {}) {
  const definition = getDefinitionBucket(type)?.[id];
  if (!definition) return 'hidden';
  if (isContentUnlocked(meta, { type, id, classId })) return 'visible';
  return definition.visibleBeforeUnlock ? 'locked-visible' : 'hidden';
}

export function getUnlockedContent(meta, { type, classId } = {}) {
  if (!type) return [];
  if (type === 'card' && classId) {
    const { shared, scoped } = getCardUnlockBuckets(meta, classId);
    return [...new Set([
      ...Object.entries(shared).filter(([, state]) => state?.unlocked).map(([id]) => id),
      ...Object.entries(scoped || {}).filter(([, state]) => state?.unlocked).map(([id]) => id),
    ])];
  }
  if (type === 'card') {
    return Object.entries(getCardUnlockBuckets(meta).shared)
      .filter(([, state]) => state?.unlocked)
      .map(([id]) => id);
  }
  if (type === 'relic' && classId) {
    const { shared, scoped } = getRelicUnlockBuckets(meta, classId);
    return [...new Set([
      ...Object.entries(shared).filter(([, state]) => state?.unlocked).map(([id]) => id),
      ...Object.entries(scoped || {}).filter(([, state]) => state?.unlocked).map(([id]) => id),
    ])];
  }
  return Object.entries(getUnlockBucket(meta, type))
    .filter(([, state]) => state?.unlocked)
    .map(([id]) => id);
}

export function getContentLabel({ type, id, label, fallbackLabel } = {}) {
  if (!type || !id) return '';
  if (label) return String(label);
  const definitionLabel = getDefinitionBucket(type)?.[id]?.displayName || fallbackLabel || '';
  if (type === 'curse') return getRunCurseLabel(id) || definitionLabel || id;
  if (type === 'card') return getRunCardLabel(id) || definitionLabel || id;
  if (type === 'relic') return getRunRelicLabel(id) || definitionLabel || id;
  return definitionLabel || id;
}

export function getUnlockRequirementLabel({ type, id } = {}) {
  return getDefinitionBucket(type)?.[id]?.unlockHint || '해금 필요';
}

export function buildUnlockRoadmap(meta, { classId } = {}) {
  const accountEntries = [];
  const scopedClassId = classId ? String(classId) : '';
  const classEntries = [];
  let order = 0;

  for (const [contentType, bucket] of Object.entries(UNLOCKABLES || {})) {
    const singularType = contentType.slice(0, -1);
    for (const definition of Object.values(bucket || {})) {
      if (definition?.scope === 'account') {
        const entry = buildUnlockRoadmapEntry(meta, singularType, definition);
        if (entry) accountEntries.push({ ...entry, order: order += 1 });
        continue;
      }

      if (!scopedClassId || String(definition?.classId || '') !== scopedClassId) continue;
      const entry = buildUnlockRoadmapEntry(meta, singularType, definition);
      if (entry) classEntries.push({ ...entry, order: order += 1 });
    }
  }

  return {
    account: sortRoadmapEntries(accountEntries).slice(0, 2).map(({ entry }) => entry),
    class: sortRoadmapEntries(classEntries).slice(0, 2).map(({ entry }) => entry),
  };
}
