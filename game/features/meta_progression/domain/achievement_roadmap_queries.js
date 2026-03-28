import { ACHIEVEMENTS } from './achievement_definitions.js';
import { getAchievementProgressValue } from './achievement_progress_queries.js';
import { UNLOCKABLES } from './unlockable_definitions.js';

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

function isAchievementUnlocked(meta, achievementId) {
  return !!meta?.achievements?.states?.[achievementId]?.unlocked;
}

function buildRewardLabel(achievement = {}) {
  const reward = Array.isArray(achievement?.rewards) ? achievement.rewards[0] : null;
  if (!reward?.contentType || !reward?.contentId) return '';
  const bucket = UNLOCKABLES?.[`${reward.contentType}s`] || {};
  const definition = bucket?.[reward.contentId] || null;
  const displayLabel = definition?.displayName || reward.contentId;
  return `보상 · ${displayLabel}`;
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
    progress,
    progressLabel: target > 0 ? `${progress} / ${target}` : `${progress}`,
    focusLabel: describeAchievementFocus(condition),
    rewardLabel: buildRewardLabel(achievement),
    remaining: target > 0 ? Math.max(0, target - progress) : 0,
    target,
    priority: getAchievementPriority(condition),
  };
}

function getAchievementPriority(condition = {}) {
  switch (condition?.type) {
    case 'region_victories':
      return 0;
    case 'boss_kills':
      return 1;
    case 'highest_ascension_victory':
      return 2;
    default:
      return 3;
  }
}

function compareAchievementEntries(left, right) {
  const leftSpotlight = isSpotlightAchievement(left);
  const rightSpotlight = isSpotlightAchievement(right);
  if (leftSpotlight !== rightSpotlight) return leftSpotlight ? -1 : 1;

  if (leftSpotlight && rightSpotlight) {
    const leftStage = getAchievementStage(left);
    const rightStage = getAchievementStage(right);
    if (leftStage !== rightStage) return leftStage - rightStage;
    if ((left.priority || 0) !== (right.priority || 0)) return (left.priority || 0) - (right.priority || 0);
    if (left.remaining !== right.remaining) return left.remaining - right.remaining;
  }
  if (left.target !== right.target) return left.target - right.target;
  if (left.remaining !== right.remaining) return left.remaining - right.remaining;
  if ((left.order || 0) !== (right.order || 0)) return (left.order || 0) - (right.order || 0);
  return left.id.localeCompare(right.id);
}

function getAchievementStage(entry = {}) {
  if ((entry.remaining || 0) > 0 && (entry.progress || 0) > 0) return 0;
  if ((entry.remaining || 0) === 0) return 1;
  return 2;
}

function isSpotlightAchievement(entry = {}) {
  return (entry.priority || 0) < 3 && (((entry.progress || 0) > 0) || ((entry.remaining || 0) === 0));
}

export function buildAchievementRoadmap(meta, { classId = '', limit = 2 } = {}) {
  const account = [];
  const scopedClassId = String(classId || '');
  const scoped = [];
  let order = 0;

  for (const achievement of Object.values(ACHIEVEMENTS || {})) {
    if (!achievement?.id || isAchievementUnlocked(meta, achievement.id)) continue;
    const entry = { ...buildAchievementEntry(meta, achievement), order: order += 1 };
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
