import { ACHIEVEMENTS } from '../domain/achievement_definitions.js';
import { getAchievementProgressValue } from '../domain/achievement_progress_queries.js';
import { UNLOCKABLES } from '../domain/unlockable_definitions.js';
import { isContentUnlocked } from '../domain/content_unlock_state_queries.js';
import {
  getRunCardLabel,
  getRunCurseLabel,
  getRunRelicLabel,
} from '../../run/ports/public_content_capabilities.js';

function getDefinitionBucket(type) {
  return UNLOCKABLES?.[`${type}s`] || {};
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

export function getContentLabel({ type, id, label, fallbackLabel } = {}) {
  if (!type || !id) return '';
  if (label) return String(label);
  const definitionLabel = getDefinitionBucket(type)?.[id]?.displayName || fallbackLabel || '';
  if (type === 'curse') return getRunCurseLabel(id) || definitionLabel || id;
  if (type === 'card') return getRunCardLabel(id) || definitionLabel || id;
  if (type === 'relic') return getRunRelicLabel(id) || definitionLabel || id;
  return definitionLabel || id;
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
