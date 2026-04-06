const MIN_REGION_FLOORS = 6;
const MAX_REGION_FLOORS = 9;

function normalizeRegionIndex(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}

function getRegionById(data, regionId) {
  if (!Array.isArray(data?.regions) || data.regions.length === 0) return null;
  const normalized = normalizeRegionIndex(regionId);
  return data.regions.find((region) => Number(region?.id) === normalized) || null;
}

function getRegionFloorCache(regionFloors) {
  if (!regionFloors || typeof regionFloors !== 'object' || Array.isArray(regionFloors)) {
    return null;
  }

  return regionFloors;
}

function getRegionRouteMap(regionRoute) {
  if (!regionRoute || typeof regionRoute !== 'object' || Array.isArray(regionRoute)) {
    return null;
  }

  return regionRoute;
}

function rollRegionFloors(randomFn = Math.random) {
  return MIN_REGION_FLOORS + Math.floor(randomFn() * (MAX_REGION_FLOORS - MIN_REGION_FLOORS + 1));
}

export function getBaseRegionSequence(data = null) {
  const fromData = Array.isArray(data?.baseRegionSequence) ? data.baseRegionSequence : [];
  if (fromData.length > 0) {
    return fromData
      .map((value) => normalizeRegionIndex(value))
      .filter((value, idx, arr) => arr.indexOf(value) === idx);
  }

  return [0, 1, 2, 3, 4];
}

export function getRegionCount(data = null) {
  const sequence = getBaseRegionSequence(data);
  return sequence.length || 5;
}

export function getBaseRegionIndex(regionIdx = 0, data = null) {
  const count = getRegionCount(data);
  if (!count) return 0;
  return normalizeRegionIndex(regionIdx) % count;
}

export function getRegionIdForStage(regionIdx = 0, options = {}) {
  const data = options.data || null;
  const count = getRegionCount(data);
  if (!count) return 0;

  const sequence = getBaseRegionSequence(data);
  const idx = normalizeRegionIndex(regionIdx);
  const baseIdx = getBaseRegionIndex(idx, data);
  const fallbackRegionId = sequence[baseIdx] ?? baseIdx;

  const routeMap = getRegionRouteMap(options.regionRoute);
  if (!routeMap) return fallbackRegionId;

  const explicit = Number(routeMap[String(idx)]);
  if (Number.isFinite(explicit)) return normalizeRegionIndex(explicit);
  return fallbackRegionId;
}

export function resolveRegionFloors(regionAbsIdx, baseFloors, options = {}) {
  const fallback = Math.max(1, Math.floor(Number(baseFloors) || 1));
  const regionFloors = getRegionFloorCache(options.regionFloors);
  if (!regionFloors) {
    return {
      floors: fallback,
      nextRegionFloors: null,
    };
  }

  const key = String(normalizeRegionIndex(regionAbsIdx));
  const existing = Number(regionFloors[key]);
  if (Number.isFinite(existing) && existing >= MIN_REGION_FLOORS && existing <= MAX_REGION_FLOORS) {
    return {
      floors: Math.floor(existing),
      nextRegionFloors: regionFloors,
    };
  }

  const rolled = typeof options.rollRegionFloors === 'function'
    ? options.rollRegionFloors()
    : rollRegionFloors();

  return {
    floors: rolled,
    nextRegionFloors: {
      ...regionFloors,
      [key]: rolled,
    },
  };
}

export function resolveRegionData(regionIdx = 0, options = {}) {
  const data = options.data || null;
  const count = getRegionCount(data);
  if (!count) {
    return {
      region: null,
      nextRegionFloors: getRegionFloorCache(options.regionFloors),
    };
  }

  const idx = normalizeRegionIndex(regionIdx);
  const sequence = getBaseRegionSequence(data);
  const baseIdx = getBaseRegionIndex(idx, data);
  const resolvedRegionId = getRegionIdForStage(idx, {
    data,
    regionRoute: options.regionRoute,
  });
  const baseRegion = getRegionById(data, resolvedRegionId)
    || getRegionById(data, sequence[baseIdx] ?? baseIdx)
    || getRegionById(data, baseIdx);

  if (!baseRegion) {
    return {
      region: null,
      nextRegionFloors: getRegionFloorCache(options.regionFloors),
    };
  }

  const endless = !!options.endless;
  const { floors, nextRegionFloors } = resolveRegionFloors(idx, baseRegion.floors, {
    regionFloors: options.regionFloors,
    rollRegionFloors: options.rollRegionFloors,
  });
  const regionWithFloors = {
    ...baseRegion,
    floors,
    _baseRegion: baseIdx,
    _resolvedRegionId: resolvedRegionId,
  };

  if (!endless || idx < count) {
    return {
      region: regionWithFloors,
      nextRegionFloors,
    };
  }

  const cycle = Math.floor(idx / count);
  return {
    region: {
      ...regionWithFloors,
      _endlessCycle: cycle,
      name: `${baseRegion.name} · 순환 ${cycle + 1}`,
    },
    nextRegionFloors,
  };
}
