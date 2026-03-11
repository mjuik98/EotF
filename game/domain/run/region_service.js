import { getRegionIdForStage } from '../../systems/run_rules.js';

export function resolveActiveRegionId(gs, deps = {}) {
  const activeRegionId = Number(gs?._activeRegionId);
  if (Number.isFinite(activeRegionId)) {
    return Math.max(0, Math.floor(activeRegionId));
  }

  if (typeof deps.getRegionData === 'function') {
    const regionIdFromData = Number(deps.getRegionData(gs?.currentRegion, gs)?.id);
    if (Number.isFinite(regionIdFromData)) {
      return Math.max(0, Math.floor(regionIdFromData));
    }
  }

  const resolveRegionId = deps.getRegionIdForStage || getRegionIdForStage;
  const regionIdx = Math.max(0, Math.floor(Number(gs?.currentRegion) || 0));
  const resolved = Number(resolveRegionId(regionIdx, gs));
  if (Number.isFinite(resolved)) {
    return Math.max(0, Math.floor(resolved));
  }

  return regionIdx;
}
