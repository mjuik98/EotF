import { DATA } from '../ports/public_data_runtime_capabilities.js';
import {
  getBaseRegionIndex as getDomainBaseRegionIndex,
  getRegionCount as getDomainRegionCount,
  getRegionIdForStage as getDomainRegionIdForStage,
  resolveRegionData,
} from '../domain/run_region_rule_queries.js';

function ensureRuntimeRegionState(gs, key) {
  if (!gs) return null;
  if (!gs[key] || typeof gs[key] !== 'object' || Array.isArray(gs[key])) {
    gs[key] = {};
  }

  return gs[key];
}

function isEndlessRun(gs, options = {}) {
  if (typeof options.endless !== 'undefined') {
    return !!options.endless;
  }

  return !!(gs?.runConfig?.endlessMode || gs?.runConfig?.endless);
}

export function getRegionCount(data = DATA) {
  return getDomainRegionCount(data);
}

export function getBaseRegionIndex(regionIdx = 0, data = DATA) {
  return getDomainBaseRegionIndex(regionIdx, data);
}

export function getRegionIdForStage(regionIdx = 0, gsRef = null, options = {}) {
  const data = options.data || DATA;
  const regionRoute = gsRef
    ? ensureRuntimeRegionState(gsRef, 'regionRoute')
    : options.regionRoute || null;

  return getDomainRegionIdForStage(regionIdx, {
    data,
    regionRoute,
  });
}

export function getRegionData(regionIdx = 0, gsRef = null, options = {}) {
  const gs = gsRef || null;
  const data = options.data || DATA;
  const regionRoute = gs ? ensureRuntimeRegionState(gs, 'regionRoute') : options.regionRoute || null;
  const regionFloors = gs ? ensureRuntimeRegionState(gs, 'regionFloors') : options.regionFloors || null;
  const { region, nextRegionFloors } = resolveRegionData(regionIdx, {
    data,
    endless: isEndlessRun(gs, options),
    regionFloors,
    regionRoute,
    rollRegionFloors: options.rollRegionFloors,
  });

  if (gs && nextRegionFloors && nextRegionFloors !== regionFloors) {
    gs.regionFloors = nextRegionFloors;
  }

  return region;
}
