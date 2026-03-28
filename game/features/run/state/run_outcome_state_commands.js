import {
  selectCombatState,
  selectMetaState,
  selectPlayerState,
  selectStatsState,
} from '../../../core/store/selectors.js';

const RunOutcomePlayerActionIds = Object.freeze({
  playerEnergySet: 'player:energy-set',
  playerHpSet: 'player:hp-set',
  playerMaxEnergySet: 'player:max-energy-set',
  playerMaxHpSet: 'player:max-hp-set',
});

function dispatchRunOutcomePlayerState(gs, action, payload) {
  if (typeof gs?.dispatch !== 'function') return null;
  const result = gs.dispatch(action, payload);
  return result !== undefined && result !== null ? result : null;
}

function applyRunPlayerMaxHpState(gs, amount) {
  const result = dispatchRunOutcomePlayerState(gs, RunOutcomePlayerActionIds.playerMaxHpSet, { amount });
  if (result) return result;

  const player = selectPlayerState(gs);
  if (!player) return null;
  player.maxHp = Math.max(1, Number(amount) || 1);
  player.hp = Math.min(player.maxHp, player.hp);
  return { maxHpAfter: player.maxHp, hpAfter: player.hp };
}

function applyRunPlayerHpState(gs, amount) {
  const result = dispatchRunOutcomePlayerState(gs, RunOutcomePlayerActionIds.playerHpSet, { amount });
  if (result) return result;

  const player = selectPlayerState(gs);
  if (!player) return null;
  player.hp = Math.max(0, Math.min(Math.max(1, Number(player.maxHp || 1) || 1), Number(amount) || 0));
  return { hpAfter: player.hp };
}

function applyRunPlayerMaxEnergyState(gs, amount) {
  const result = dispatchRunOutcomePlayerState(gs, RunOutcomePlayerActionIds.playerMaxEnergySet, {
    amount,
    maxEnergyCap: undefined,
  });
  if (result) return result;

  const player = selectPlayerState(gs);
  if (!player) return null;
  player.maxEnergy = Math.max(1, Number(amount) || 1);
  player.energy = Math.min(player.maxEnergy, Math.max(0, Number(player.energy || 0) || 0));
  return { maxEnergyAfter: player.maxEnergy, energyAfter: player.energy };
}

function applyRunPlayerEnergyState(gs, amount) {
  const result = dispatchRunOutcomePlayerState(gs, RunOutcomePlayerActionIds.playerEnergySet, { amount });
  if (result) return result;

  const player = selectPlayerState(gs);
  if (!player) return null;
  player.energy = Math.max(0, Math.min(Math.max(0, Number(player.maxEnergy || 0) || 0), Number(amount) || 0));
  return { energyAfter: player.energy };
}

export function applyPlayerMaxHpPenalty(gs, amount) {
  const penalty = Math.max(0, Math.floor(Number(amount) || 0));
  const player = selectPlayerState(gs);
  if (!penalty || !player) return player?.maxHp || 0;
  const nextMaxHp = Math.max(1, player.maxHp - penalty);
  applyRunPlayerMaxHpState(gs, nextMaxHp);
  applyRunPlayerHpState(gs, Math.min(player.hp, nextMaxHp));
  return nextMaxHp;
}

export function applySilenceCurseTurnStart(gs, { limit = 1, recoveryTurn = 4, recoveryMaxEnergy = 3 } = {}) {
  const player = selectPlayerState(gs);
  const combat = selectCombatState(gs);
  if (!player || !combat) return null;

  if (combat.turn <= 3) {
    applyRunPlayerMaxEnergyState(gs, Math.min(player.maxEnergy, limit));
    applyRunPlayerEnergyState(gs, Math.min(player.energy, limit));
  } else if (combat.turn === recoveryTurn) {
    applyRunPlayerMaxEnergyState(gs, Math.max(player.maxEnergy, recoveryMaxEnergy));
  }
  return { energy: player.energy, maxEnergy: player.maxEnergy };
}

export function recordVictoryProgress(gs) {
  const meta = selectMetaState(gs);
  const progress = meta?.progress;
  if (!meta || !progress) return 0;
  meta.unlocks.ascension = true;
  progress.victories = (progress.victories || 0) + 1;
  if (gs?.runConfig?.curse && gs.runConfig.curse !== 'none') {
    progress.cursedVictories = (progress.cursedVictories || 0) + 1;
  }
  const regionIndex = Math.max(0, Math.floor(Number(gs?.currentRegion) || 0));
  if (!progress.regionVictories || typeof progress.regionVictories !== 'object') {
    progress.regionVictories = {};
  }
  progress.regionVictories[regionIndex] = (progress.regionVictories[regionIndex] || 0) + 1;
  progress.highestVictoryAscension = Math.max(
    Number(progress.highestVictoryAscension || 0),
    Math.max(0, Math.floor(Number(gs?.runConfig?.ascension) || 0)),
  );
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
