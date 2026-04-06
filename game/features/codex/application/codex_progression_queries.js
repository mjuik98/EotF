import {
  ACHIEVEMENTS,
  getAchievementProgressValue,
} from '../../meta_progression/ports/public_achievement_capabilities.js';
import { getContentLabel } from '../../meta_progression/ports/public_unlock_application_capabilities.js';
import {
  isContentUnlocked,
  UNLOCKABLES,
} from '../../meta_progression/ports/public_unlock_capabilities.js';

const CODEX_MILESTONE_TYPES = new Set([
  'codex_entries',
  'codex_enemies',
  'codex_cards',
  'codex_items',
]);

const CATEGORY_LABELS = Object.freeze({
  enemies: '적',
  cards: '카드',
  items: '유물',
});

function describeCodexFocus(type = '') {
  switch (type) {
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

function getCodexFocusPriority(type = '') {
  if (type === 'codex_entries') return 1;
  if (CODEX_MILESTONE_TYPES.has(type)) return 0;
  return 2;
}

function buildCodexRewardEntry(meta, contentType, definition) {
  const achievementId = Array.isArray(definition?.requires) ? definition.requires[0] : '';
  const achievement = ACHIEVEMENTS?.[achievementId];
  const condition = achievement?.condition || {};
  if (!CODEX_MILESTONE_TYPES.has(condition.type)) return null;

  const classId = definition?.scope === 'class' ? String(definition.classId || '') : '';
  if (isContentUnlocked(meta, {
    type: contentType,
    id: definition.id,
    ...(classId ? { classId } : {}),
  })) {
    return null;
  }

  const target = Number(condition.count || 0);
  const progress = Math.min(target || 0, getAchievementProgressValue(meta, condition));

  return {
    contentType,
    contentId: definition.id,
    contentLabel: getContentLabel({ type: contentType, id: definition.id, fallbackLabel: definition.displayName }),
    achievementTitle: achievement?.title || '',
    progressLabel: target > 0 ? `${progress} / ${target}` : '',
    focusLabel: describeCodexFocus(condition.type),
    focusPriority: getCodexFocusPriority(condition.type),
    remaining: Math.max(0, target - progress),
  };
}

export function buildCodexRewardRoadmap(meta, { limit = 2 } = {}) {
  const entries = [];

  for (const [contentTypePlural, bucket] of Object.entries(UNLOCKABLES || {})) {
    const contentType = contentTypePlural.slice(0, -1);
    for (const definition of Object.values(bucket || {})) {
      if (definition?.scope !== 'account') continue;
      const entry = buildCodexRewardEntry(meta, contentType, definition);
      if (entry) entries.push(entry);
    }
  }

  return entries
    .sort((left, right) => {
      if (left.focusPriority !== right.focusPriority) {
        return left.focusPriority - right.focusPriority;
      }
      if (left.remaining !== right.remaining) return left.remaining - right.remaining;
      return left.contentId.localeCompare(right.contentId);
    })
    .slice(0, Math.max(0, Number(limit) || 0));
}

export function buildRecentCodexDiscoveries(meta, { data = null, limit = 3 } = {}) {
  const records = meta?.codexRecords || {};
  const items = [];

  Object.entries(CATEGORY_LABELS).forEach(([category, categoryLabel]) => {
    Object.entries(records?.[category] || {}).forEach(([id, entry]) => {
      if (!entry?.firstSeen) return;
      const label = data?.[category]?.[id]?.name || id;
      items.push({
        category,
        categoryLabel,
        id,
        label,
        firstSeen: String(entry.firstSeen),
      });
    });
  });

  return items
    .sort((left, right) => {
      if (left.firstSeen !== right.firstSeen) return left.firstSeen < right.firstSeen ? 1 : -1;
      return left.id.localeCompare(right.id);
    })
    .slice(0, Math.max(0, Number(limit) || 0));
}
