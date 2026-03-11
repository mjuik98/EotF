function normalizeCombatMode(mode) {
  if (mode === true) return 'boss';
  if (mode === false) return 'normal';
  return typeof mode === 'string' ? mode : 'normal';
}

function isHiddenBossEligible(gs, { getBaseRegionIndex, getRegionCount } = {}) {
  if (!gs) return false;
  if (typeof getBaseRegionIndex !== 'function' || typeof getRegionCount !== 'function') return false;

  const currentRegion = gs.currentRegion;
  const savedMerchant = gs.worldMemory?.savedMerchant || 0;
  const storyPieceCount = gs.meta?.storyPieces?.length || 0;
  const isLastBaseRegion = getBaseRegionIndex(currentRegion) === Math.max(0, getRegionCount() - 1);
  return isLastBaseRegion
    && savedMerchant >= 1
    && storyPieceCount >= 5;
}

function getBossSpawnEntries(region, gs, deps = {}) {
  const hiddenBoss = isHiddenBossEligible(gs, deps);
  const bossArray = region?.boss || ['ancient_echo'];
  const bossKey = hiddenBoss
    ? 'echo_origin'
    : (Array.isArray(bossArray) ? bossArray[Math.floor(Math.random() * bossArray.length)] : bossArray);

  return {
    entries: [{ key: bossKey, extra: { phase: 1 } }],
    isHiddenBoss: hiddenBoss,
  };
}

function getMiniBossSpawnEntries(region) {
  const miniBossPool = Array.isArray(region?.miniBoss) && region.miniBoss.length > 0
    ? region.miniBoss
    : (Array.isArray(region?.elites) && region.elites.length > 0
      ? region.elites
      : (Array.isArray(region?.boss) && region.boss.length > 0 ? region.boss : ['ancient_echo']));
  const miniBossKey = miniBossPool[Math.floor(Math.random() * miniBossPool.length)];
  return {
    entries: [{ key: miniBossKey, extra: { phase: 1, isMiniBoss: true, isBoss: false } }],
    isHiddenBoss: false,
  };
}

function resolveNormalEnemyCount(gs, { getBaseRegionIndex } = {}) {
  const currentRegion = gs.currentRegion;
  const currentFloor = gs.currentFloor || 0;
  const regIdx = typeof getBaseRegionIndex === 'function'
    ? getBaseRegionIndex(currentRegion)
    : currentRegion;

  if (currentFloor <= 1) return 1;
  if (regIdx === 0) return Math.random() < 0.4 ? 2 : 1;

  const roll = Math.random();
  if (roll < 0.2) return 3;
  if (roll < 0.7) return 2;
  return 1;
}

function getNormalSpawnEntries(region, gs, data, deps = {}) {
  const currentNodeType = gs.currentNode?.type;
  const isEliteNode = currentNodeType === 'elite';
  if (isEliteNode && region?.elites?.length) {
    const eliteKey = region.elites[Math.floor(Math.random() * region.elites.length)];
    if (data?.enemies?.[eliteKey]) {
      return {
        entries: [{ key: eliteKey, extra: {} }],
        isHiddenBoss: false,
      };
    }
  }

  const count = resolveNormalEnemyCount(gs, deps);
  const entries = [];
  for (let i = 0; i < count; i++) {
    const enemyPool = region?.enemies || [];
    const enemyKey = enemyPool[Math.floor(Math.random() * enemyPool.length)];
    if (!data?.enemies?.[enemyKey]) continue;
    entries.push({ key: enemyKey, extra: {} });
  }

  return {
    entries,
    isHiddenBoss: false,
  };
}

export function createEnemySpawnPlan({ gs, data, mode, getRegionData, getBaseRegionIndex, getRegionCount } = {}) {
  const currentRegion = gs?.currentRegion;
  const region = typeof getRegionData === 'function' ? getRegionData(currentRegion, gs) : null;
  const combatMode = normalizeCombatMode(mode);
  if (!region) {
    return { region: null, combatMode, entries: [], spawnedKeys: [], isHiddenBoss: false };
  }

  let plan;
  if (combatMode === 'boss') {
    plan = getBossSpawnEntries(region, gs, { getBaseRegionIndex, getRegionCount });
  } else if (combatMode === 'mini_boss') {
    plan = getMiniBossSpawnEntries(region);
  } else {
    plan = getNormalSpawnEntries(region, gs, data, { getBaseRegionIndex });
  }

  return {
    region,
    combatMode,
    entries: plan.entries,
    spawnedKeys: plan.entries.map((entry) => entry.key),
    isHiddenBoss: plan.isHiddenBoss,
  };
}
