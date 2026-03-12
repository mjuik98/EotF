export function buildCombatEndOutcome(
  gs,
  {
    getBaseRegionIndex,
    getRegionCount,
    isEndlessRun,
  } = {},
) {
  const combatState = gs?.combat || {};
  const preEndEnemies = Array.isArray(combatState.enemies) ? [...combatState.enemies] : [];
  const isBoss = !!combatState.bossDefeated || preEndEnemies.some((enemy) => enemy?.isBoss);
  const isMiniBoss = !!combatState.miniBossDefeated
    || preEndEnemies.some((enemy) => enemy?.isMiniBoss)
    || gs?.currentNode?.type === 'mini_boss';

  const currentRegion = gs?.currentRegion;
  const baseRegionIndex = typeof getBaseRegionIndex === 'function'
    ? getBaseRegionIndex(currentRegion)
    : currentRegion;
  const regionCount = typeof getRegionCount === 'function'
    ? getRegionCount()
    : 0;
  const isLastRegion = baseRegionIndex === Math.max(0, regionCount - 1);
  const endlessRun = typeof isEndlessRun === 'function' ? !!isEndlessRun(gs) : false;

  return {
    isBoss,
    isMiniBoss,
    isLastRegion,
    rewardMode: isBoss ? 'boss' : (isMiniBoss ? 'mini_boss' : false),
    returnDirectlyToRun: isBoss && isLastRegion && endlessRun,
    bossRewardState: isBoss
      ? { pending: true, lastRegion: isLastRegion }
      : null,
    summary: {
      dealt: (gs?.stats?.damageDealt || 0) - (gs?._combatStartDmg || 0),
      taken: (gs?.stats?.damageTaken || 0) - (gs?._combatStartTaken || 0),
      kills: (gs?.player?.kills || 0) - (gs?._combatStartKills || 0),
    },
    delays: {
      directReturnMs: 300,
      rewardScreenMs: 1000,
    },
    uiReset: {
      hideTooltips: true,
      clearHand: true,
      resetCombatUi: true,
      resetChain: true,
    },
  };
}
