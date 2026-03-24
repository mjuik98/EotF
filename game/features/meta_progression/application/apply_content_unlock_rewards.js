function ensureUnlockBucket(meta, reward = {}) {
  const type = `${reward.contentType || ''}s`;
  if (reward.contentType === 'card') {
    const cards = meta?.contentUnlocks?.cards;
    if (!cards) return null;
    const scopeKey = reward.classId ? String(reward.classId) : 'shared';
    if (!cards[scopeKey]) cards[scopeKey] = {};
    return cards[scopeKey];
  }
  if (reward.contentType === 'relic' && reward.classId) {
    const contentUnlocks = meta?.contentUnlocks;
    if (!contentUnlocks) return null;
    if (!contentUnlocks.relicsByClass || typeof contentUnlocks.relicsByClass !== 'object') {
      contentUnlocks.relicsByClass = {};
    }
    const relicsByClass = contentUnlocks.relicsByClass;
    if (!relicsByClass) return null;
    const scopeKey = String(reward.classId);
    if (!relicsByClass[scopeKey]) relicsByClass[scopeKey] = {};
    return relicsByClass[scopeKey];
  }

  return meta?.contentUnlocks?.[type] || null;
}

export function applyContentUnlockRewards(meta, rewards = [], achievementId, now = Date.now()) {
  const unlocked = [];

  for (const reward of rewards) {
    if (reward?.type !== 'unlock') continue;

    const bucket = ensureUnlockBucket(meta, reward);
    if (!bucket || bucket[reward.contentId]?.unlocked) continue;

    bucket[reward.contentId] = {
      unlocked: true,
      unlockedAt: now,
      source: achievementId,
    };
    unlocked.push({
      type: reward.contentType,
      id: reward.contentId,
      ...(reward.classId ? { classId: String(reward.classId) } : {}),
      ...(reward.contentLabel ? { label: String(reward.contentLabel) } : {}),
      source: achievementId,
    });
  }

  return unlocked;
}
