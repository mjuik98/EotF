export function applyPlayerMaxHpPenalty(gs, amount) {
  const penalty = Math.max(0, Math.floor(Number(amount) || 0));
  if (!penalty || !gs?.player) return gs?.player?.maxHp || 0;
  gs.player.maxHp = Math.max(1, gs.player.maxHp - penalty);
  gs.player.hp = Math.min(gs.player.hp, gs.player.maxHp);
  return gs.player.maxHp;
}

export function applySilenceCurseTurnStart(gs, { limit = 1, recoveryTurn = 4, recoveryMaxEnergy = 3 } = {}) {
  if (!gs?.player || !gs?.combat) return null;
  if (gs.combat.turn <= 3) {
    gs.player.energy = Math.min(gs.player.energy, limit);
    gs.player.maxEnergy = Math.min(gs.player.maxEnergy, limit);
  } else if (gs.combat.turn === recoveryTurn) {
    gs.player.maxEnergy = Math.max(gs.player.maxEnergy, recoveryMaxEnergy);
  }
  return { energy: gs.player.energy, maxEnergy: gs.player.maxEnergy };
}

export function recordVictoryProgress(gs) {
  const progress = gs.meta.progress;
  gs.meta.unlocks.ascension = true;
  progress.victories = (progress.victories || 0) + 1;
  progress.echoShards = (progress.echoShards || 0) + 2;
  gs.meta.maxAscension = Math.max(gs.meta.maxAscension || 0, Math.min(20, progress.victories));
  if (progress.victories >= 3) gs.meta.unlocks.endless = true;
  return 5;
}

export function recordDefeatProgress(gs) {
  gs.meta.progress.failures = (gs.meta.progress.failures || 0) + 1;
  return 3;
}

export function beginRunOutcomeCommit(gs) {
  if (!gs || gs._runOutcomeCommitted) return false;
  gs._runOutcomeCommitted = true;
  return true;
}

export function captureRunOutcomeTiming(gs, now = Date.now()) {
  const stats = gs?.stats;
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
  Object.assign(gs.meta.worldMemory, gs.worldMemory || {});
  gs.meta.bestChain = Math.max(gs.meta.bestChain || 0, gs.stats?.maxChain || 0);
  return { bestChain: gs.meta.bestChain };
}

export function applyRunOutcomeRewards(gs, shardGain) {
  gs.meta.runCount = Math.max(1, (gs.meta.runCount || 1) + 1);
  gs.meta.echoFragments = Math.max(0, (gs.meta.echoFragments || 0) + shardGain);
  return gs.meta.echoFragments;
}
