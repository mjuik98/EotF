function selectCombatState(gs) {
  return gs?.combat || null;
}

function selectMetaState(gs) {
  return gs?.meta || null;
}

function selectPlayerState(gs) {
  return gs?.player || null;
}

function selectStatsState(gs) {
  return gs?.stats || null;
}

export function applyPlayerMaxHpPenalty(gs, amount) {
  const penalty = Math.max(0, Math.floor(Number(amount) || 0));
  const player = selectPlayerState(gs);
  if (!penalty || !player) return player?.maxHp || 0;
  player.maxHp = Math.max(1, player.maxHp - penalty);
  player.hp = Math.min(player.hp, player.maxHp);
  return player.maxHp;
}

export function applySilenceCurseTurnStart(gs, { limit = 1, recoveryTurn = 4, recoveryMaxEnergy = 3 } = {}) {
  const player = selectPlayerState(gs);
  const combat = selectCombatState(gs);
  if (!player || !combat) return null;

  if (combat.turn <= 3) {
    player.maxEnergy = Math.min(player.maxEnergy, limit);
    player.energy = Math.min(player.energy, limit);
  } else if (combat.turn === recoveryTurn) {
    player.maxEnergy = Math.max(player.maxEnergy, recoveryMaxEnergy);
  }
  return { energy: player.energy, maxEnergy: player.maxEnergy };
}

export function recordVictoryProgress(gs) {
  const meta = selectMetaState(gs);
  const progress = meta?.progress;
  if (!meta || !progress) return 0;
  meta.unlocks.ascension = true;
  progress.victories = (progress.victories || 0) + 1;
  progress.echoShards = (progress.echoShards || 0) + 2;
  meta.maxAscension = Math.max(meta.maxAscension || 0, Math.min(20, progress.victories));
  if (progress.victories >= 3) meta.unlocks.endless = true;
  return 5;
}

export function recordDefeatProgress(gs) {
  const progress = selectMetaState(gs)?.progress;
  if (!progress) return 0;
  progress.failures = (progress.failures || 0) + 1;
  return 3;
}

export function beginRunOutcomeCommit(gs) {
  if (!gs || gs._runOutcomeCommitted) return false;
  gs._runOutcomeCommitted = true;
  return true;
}

export function captureRunOutcomeTiming(gs, now = Date.now()) {
  const stats = selectStatsState(gs);
  if (!stats || typeof stats !== 'object') return null;

  const runStartTs = Number(stats._runStartTs);
  if (Number.isFinite(runStartTs) && runStartTs > 0) {
    stats.clearTimeMs = Math.max(0, now - runStartTs);
  }

  if (!stats.regionClearTimes || typeof stats.regionClearTimes !== 'object' || Array.isArray(stats.regionClearTimes)) {
    stats.regionClearTimes = {};
  }
  const regionIndex = Math.max(0, Math.floor(Number(gs.currentRegion) || 0));
  const regionStartTs = Number(stats._regionStartTs);
  if (Number.isFinite(regionStartTs) && regionStartTs > 0) {
    stats.regionClearTimes[regionIndex] = Math.max(0, now - regionStartTs);
  }

  return stats;
}

export function syncRunOutcomeMeta(gs) {
  const meta = selectMetaState(gs);
  if (!meta) return null;
  Object.assign(meta.worldMemory, gs.worldMemory || {});
  meta.bestChain = Math.max(meta.bestChain || 0, selectStatsState(gs)?.maxChain || 0);
  return { bestChain: meta.bestChain };
}

export function applyRunOutcomeRewards(gs, shardGain) {
  const meta = selectMetaState(gs);
  if (!meta) return 0;
  meta.runCount = Math.max(1, (meta.runCount || 1) + 1);
  meta.echoFragments = Math.max(0, (meta.echoFragments || 0) + shardGain);
  return meta.echoFragments;
}
