export const MAX_RECENT_COMBAT_FEED_ENTRIES = 3;

const EXCLUDED_TYPES = new Set(['system', 'turn-divider']);
const DIRECT_RESULT_TYPES = new Set(['card-log', 'buff', 'support', 'status']);

function isEnemyDamageLine(entry) {
  return entry?.type === 'damage' && /→ 플레이어: \d+ 피해/.test(entry.msg || '');
}

function isCardResultLine(entry) {
  return /\[[^\]]+\]/.test(entry?.msg || '');
}

function isEchoActionLine(entry) {
  if (entry?.type !== 'echo') return false;
  return !/^\s*적\b/.test(entry.msg || '');
}

export function isRecentCombatFeedEligible(entry) {
  const recentFeedMeta = entry?.meta?.recentFeed;
  if (recentFeedMeta && typeof recentFeedMeta.eligible === 'boolean') {
    return recentFeedMeta.eligible;
  }
  if (!entry?.msg || EXCLUDED_TYPES.has(entry.type)) return false;
  if (isEnemyDamageLine(entry)) return false;
  if (DIRECT_RESULT_TYPES.has(entry.type)) return true;
  if (isCardResultLine(entry)) return true;
  if (isEchoActionLine(entry)) return true;
  return false;
}

export function selectRecentCombatFeedEntries(logEntries = []) {
  if (!Array.isArray(logEntries) || logEntries.length === 0) return [];
  return logEntries
    .filter(isRecentCombatFeedEligible)
    .slice(-MAX_RECENT_COMBAT_FEED_ENTRIES)
    .map((entry) => {
      const recentFeedText = entry?.meta?.recentFeed?.text;
      if (!recentFeedText) return entry;
      return {
        ...entry,
        msg: recentFeedText,
      };
    });
}
