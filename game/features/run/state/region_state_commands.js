export function normalizeTargetRegionId(rawTargetRegionId) {
  if (rawTargetRegionId === null || rawTargetRegionId === undefined || rawTargetRegionId === '') {
    return null;
  }

  const parsedTargetRegionId = Number(rawTargetRegionId);
  if (!Number.isFinite(parsedTargetRegionId)) return null;
  return Math.max(0, Math.floor(parsedTargetRegionId));
}

export function advanceRegionState(state, { now = Date.now(), targetRegionId = null } = {}) {
  if (!state) {
    return {
      currentRegion: null,
      currentFloor: null,
      targetRegionId: null,
    };
  }

  if (state.stats && typeof state.stats === 'object') {
    if (!state.stats.regionClearTimes || typeof state.stats.regionClearTimes !== 'object' || Array.isArray(state.stats.regionClearTimes)) {
      state.stats.regionClearTimes = {};
    }
    const regionIndex = Math.max(0, Math.floor(Number(state.currentRegion) || 0));
    const regionStartTs = Number(state.stats._regionStartTs);
    if (Number.isFinite(regionStartTs) && regionStartTs > 0) {
      state.stats.regionClearTimes[regionIndex] = Math.max(0, now - regionStartTs);
    }
    state.stats._regionStartTs = now;
  }

  state.currentRegion = Math.floor(Number(state.currentRegion) || 0) + 1;
  if (!state.regionRoute || typeof state.regionRoute !== 'object' || Array.isArray(state.regionRoute)) {
    state.regionRoute = {};
  }
  if (targetRegionId !== null) {
    state.regionRoute[String(state.currentRegion)] = targetRegionId;
  } else {
    delete state.regionRoute[String(state.currentRegion)];
  }
  state.currentFloor = 0;

  return {
    currentRegion: state.currentRegion,
    currentFloor: state.currentFloor,
    targetRegionId,
  };
}

export function markRegionIntroStartState(state, now = Date.now()) {
  if (state?.stats && typeof state.stats === 'object') {
    state.stats._regionStartTs = now;
  }
  return now;
}

export function replaceGeneratedMapState(state, mapNodes) {
  if (!state) return [];
  state.mapNodes = Array.isArray(mapNodes) ? mapNodes : [];
  state.currentNode = null;
  state.currentFloor = 0;
  return state.mapNodes;
}
