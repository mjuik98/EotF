import { ACHIEVEMENTS } from './achievement_definitions.js';
import { getAchievementProgressValue } from './achievement_progress_queries.js';
import { getContentLabel } from './content_unlock_queries.js';

function describeAchievementFocus(condition = {}) {
  switch (condition?.type) {
    case 'victories':
      return '승리 런';
    case 'cursed_victories':
      return '저주 승리';
    case 'failures':
      return '패배/중단 기록';
    case 'best_chain':
      return '연쇄 달성';
    case 'world_memory_count':
      return '세계 기억';
    case 'class_level':
      return '클래스 숙련';
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

function isAchievementUnlocked(meta, achievementId) {
  return !!meta?.achievements?.states?.[achievementId]?.unlocked;
}

function buildRewardLabel(achievement = {}) {
  const reward = Array.isArray(achievement?.rewards) ? achievement.rewards[0] : null;
  if (!reward?.contentType || !reward?.contentId) return '';
  return `보상 · ${getContentLabel({
    type: reward.contentType,
    id: reward.contentId,
    fallbackLabel: reward.contentId,
  })}`;
}

function buildAchievementEntry(meta, achievement = {}) {
  const condition = achievement?.condition || {};
  const target = Math.max(0, Number(condition?.count || 0));
  const progressValue = Math.max(0, Number(getAchievementProgressValue(meta, condition) || 0));
  const progress = target > 0 ? Math.min(target, progressValue) : progressValue;

  return {
    id: String(achievement.id || ''),
    title: String(achievement.title || ''),
    icon: String(achievement.icon || '✦'),
    description: String(achievement.description || ''),
    progressLabel: target > 0 ? `${progress} / ${target}` : `${progress}`,
    focusLabel: describeAchievementFocus(condition),
    rewardLabel: buildRewardLabel(achievement),
    remaining: target > 0 ? Math.max(0, target - progress) : 0,
    target,
  };
}

function compareAchievementEntries(left, right) {
  if (left.remaining !== right.remaining) return left.remaining - right.remaining;
  if (left.target !== right.target) return left.target - right.target;
  return left.id.localeCompare(right.id);
}

export function buildAchievementRoadmap(meta, { classId = '', limit = 2 } = {}) {
  const account = [];
  const scopedClassId = String(classId || '');
  const scoped = [];

  for (const achievement of Object.values(ACHIEVEMENTS || {})) {
    if (!achievement?.id || isAchievementUnlocked(meta, achievement.id)) continue;
    const entry = buildAchievementEntry(meta, achievement);
    if (entry.remaining === 0) continue;
    if (achievement.scope === 'class') {
      if (!scopedClassId || String(achievement?.condition?.classId || '') !== scopedClassId) continue;
      scoped.push(entry);
      continue;
    }
    account.push(entry);
  }

  const size = Math.max(0, Number(limit) || 0);
  return {
    account: account.sort(compareAchievementEntries).slice(0, size),
    class: scoped.sort(compareAchievementEntries).slice(0, size),
  };
}
