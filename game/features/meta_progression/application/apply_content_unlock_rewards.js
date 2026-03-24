export function applyContentUnlockRewards(meta, rewards = [], achievementId, now = Date.now()) {
  const unlocked = [];

  for (const reward of rewards) {
    if (reward?.type !== 'unlock') continue;

    const bucket = meta?.contentUnlocks?.[`${reward.contentType}s`];
    if (!bucket || bucket[reward.contentId]?.unlocked) continue;

    bucket[reward.contentId] = {
      unlocked: true,
      unlockedAt: now,
      source: achievementId,
    };
    unlocked.push({
      type: reward.contentType,
      id: reward.contentId,
      source: achievementId,
    });
  }

  return unlocked;
}
