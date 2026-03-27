const HEAL_CURSE_MULTIPLIERS = Object.freeze({
  fatigue: 0.75,
  void_oath: 0.6,
  ruinous_tide: 0.75,
});

function clampRegionId(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, Math.floor(parsed));
}

export function resolvePlayerActiveRegionId(gs, deps = {}) {
  const direct = clampRegionId(gs?._activeRegionId);
  if (direct !== null) return direct;

  if (typeof deps.resolveActiveRegionId === 'function') {
    return clampRegionId(deps.resolveActiveRegionId(gs));
  }

  const regionIndex = Math.max(0, Math.floor(Number(gs?.currentRegion) || 0));
  const routed = clampRegionId(gs?.regionRoute?.[String(regionIndex)]);
  if (routed !== null) return routed;

  return clampRegionId(regionIndex) ?? 0;
}

export function resolvePlayerHealAmount(gs, baseAmount, deps = {}) {
  if (typeof deps.getHealAmount === 'function') {
    return Math.max(0, Math.floor(Number(deps.getHealAmount(gs, baseAmount)) || 0));
  }

  const base = Math.max(0, Math.floor(Number(baseAmount) || 0));
  if (!base) return 0;

  const ascension = Math.max(0, Math.floor(Number(gs?.runConfig?.ascension) || 0));
  const curseId = String(gs?.runConfig?.curse || 'none');
  const curseMultiplier = HEAL_CURSE_MULTIPLIERS[curseId] || 1;
  const ascensionMultiplier = Math.max(0.2, 1 - ascension * 0.02);

  return Math.max(0, Math.floor(base * ascensionMultiplier * curseMultiplier));
}
