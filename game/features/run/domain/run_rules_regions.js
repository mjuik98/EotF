import { DATA } from '../../../../data/game_data.js';

const MIN_REGION_FLOORS = 6;
const MAX_REGION_FLOORS = 9;

function rollRegionFloors() {
  return MIN_REGION_FLOORS + Math.floor(Math.random() * (MAX_REGION_FLOORS - MIN_REGION_FLOORS + 1));
}

function resolveRegionFloors(gs, regionAbsIdx, baseFloors) {
  const fallback = Math.max(1, Math.floor(Number(baseFloors) || 1));
  if (!gs) return fallback;

  if (!gs.regionFloors || typeof gs.regionFloors !== 'object' || Array.isArray(gs.regionFloors)) {
    gs.regionFloors = {};
  }

  const key = String(Math.max(0, Math.floor(Number(regionAbsIdx) || 0)));
  const existing = Number(gs.regionFloors[key]);
  if (Number.isFinite(existing) && existing >= MIN_REGION_FLOORS && existing <= MAX_REGION_FLOORS) {
    return Math.floor(existing);
  }

  const rolled = rollRegionFloors();
  gs.regionFloors[key] = rolled;
  return rolled;
}

function getBaseRegionSequence() {
  const fromData = Array.isArray(DATA?.baseRegionSequence) ? DATA.baseRegionSequence : [];
  if (fromData.length > 0) {
    return fromData
      .map((value) => Math.max(0, Math.floor(Number(value) || 0)))
      .filter((value, idx, arr) => arr.indexOf(value) === idx);
  }
  return [0, 1, 2, 3, 4];
}

function getRegionById(regionId) {
  if (!Array.isArray(DATA?.regions) || DATA.regions.length === 0) return null;
  const normalized = Math.max(0, Math.floor(Number(regionId) || 0));
  return DATA.regions.find((region) => Number(region?.id) === normalized) || null;
}

function resolveRegionRouteMap(gs) {
  if (!gs) return null;
  if (!gs.regionRoute || typeof gs.regionRoute !== 'object' || Array.isArray(gs.regionRoute)) {
    gs.regionRoute = {};
  }
  return gs.regionRoute;
}

export function getRegionCount() {
  const fromData = Array.isArray(DATA?.baseRegionSequence) ? DATA.baseRegionSequence : [];
  if (fromData.length > 0) return fromData.length;
  return 5;
}

export function getBaseRegionIndex(regionIdx = 0) {
  const count = getRegionCount();
  if (!count) return 0;
  const idx = Math.max(0, Math.floor(Number(regionIdx) || 0));
  return idx % count;
}

export function getRegionIdForStage(regionIdx = 0, gsRef = null) {
  const count = getRegionCount();
  if (!count) return 0;

  const sequence = getBaseRegionSequence();
  const idx = Math.max(0, Math.floor(Number(regionIdx) || 0));
  const baseIdx = getBaseRegionIndex(idx);
  const fallbackRegionId = sequence[baseIdx] ?? baseIdx;

  const routeMap = resolveRegionRouteMap(gsRef);
  if (!routeMap) return fallbackRegionId;

  const explicit = Number(routeMap[String(idx)]);
  if (Number.isFinite(explicit)) return Math.max(0, Math.floor(explicit));
  return fallbackRegionId;
}

export function getRegionData(regionIdx = 0, gsRef = null) {
  const count = getRegionCount();
  if (!count) return null;

  const idx = Math.max(0, Math.floor(Number(regionIdx) || 0));
  const baseIdx = getBaseRegionIndex(idx);
  const resolvedRegionId = getRegionIdForStage(idx, gsRef);

  const baseRegion = getRegionById(resolvedRegionId)
    || getRegionById(getBaseRegionSequence()[baseIdx] ?? baseIdx)
    || getRegionById(baseIdx);
  if (!baseRegion) return null;

  const gs = gsRef;
  const endless = !!(gs?.runConfig?.endlessMode || gs?.runConfig?.endless);
  const floors = resolveRegionFloors(gs, idx, baseRegion.floors);
  const regionWithFloors = {
    ...baseRegion,
    floors,
    _baseRegion: baseIdx,
    _resolvedRegionId: resolvedRegionId,
  };
  if (!endless || idx < count) return regionWithFloors;

  const cycle = Math.floor(idx / count);
  return {
    ...regionWithFloors,
    _endlessCycle: cycle,
    name: `${baseRegion.name} 쨌 ?쒗솚 ${cycle + 1}`,
  };
}
