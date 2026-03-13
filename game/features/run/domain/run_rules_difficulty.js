import { getRegionCount } from './run_rules_regions.js';

const INSCRIPTION_SCORE_WEIGHTS = {
  echo_boost: [-2, -4, -7],
  resilience: [-3, -6, -10],
  fortune: [-2, -4, -6],
  echo_memory: [-10],
  void_heritage: [-12],
};

export function getAscension(gs) {
  const level = gs?.runConfig?.ascension;
  return Number.isFinite(level) ? Math.max(0, Math.floor(level)) : 0;
}

export function isEndless(gs) {
  return !!(gs?.runConfig?.endlessMode || gs?.runConfig?.endless);
}

export function getInscriptionScoreAdjustment(gs) {
  if (!gs?.meta?.inscriptions) return 0;

  const disabled = new Set(gs?.runConfig?.disabledInscriptions || []);
  let score = 0;

  for (const [id, rawLevel] of Object.entries(gs.meta.inscriptions)) {
    if (disabled.has(id)) continue;
    const level = typeof rawLevel === 'boolean'
      ? (rawLevel ? 1 : 0)
      : Math.max(0, Math.floor(Number(rawLevel) || 0));
    if (level <= 0) continue;

    const weights = INSCRIPTION_SCORE_WEIGHTS[id];
    if (!weights?.length) continue;
    score += weights[Math.min(level, weights.length) - 1] || 0;
  }

  return score;
}

export function getDifficultyScore(gs) {
  const cfg = gs?.runConfig || {};
  let score = getAscension(gs) * 15;
  if (isEndless(gs)) score += 10;

  const curseWeight = { tax: 5, fatigue: 10, frail: 8, decay: 10, silence: 8 };

  score += curseWeight[cfg.curse || 'none'] || 0;
  score += getInscriptionScoreAdjustment(gs);
  return Math.max(0, score);
}

export function getRewardMultiplier(gs) {
  return +(1 + getDifficultyScore(gs) * 0.015).toFixed(2);
}

export function getEnemyScaleMultiplier(gs, regionAbs = 0) {
  let ascMul = 1 + getAscension(gs) * 0.06;
  if (ascMul > 1.5) ascMul = 1.5;

  const cycle = isEndless(gs) ? Math.floor(Math.max(0, regionAbs) / Math.max(1, getRegionCount())) : 0;
  const endlessMul = 1 + cycle * 0.12;
  return ascMul * endlessMul;
}

export function getHealAmount(gs, baseAmount) {
  const base = Math.max(0, Math.floor(Number(baseAmount) || 0));
  if (!base) return 0;
  let mult = 1 - getAscension(gs) * 0.02;
  if ((gs?.runConfig?.curse || 'none') === 'fatigue') mult *= 0.75;
  return Math.max(0, Math.floor(base * Math.max(0.2, mult)));
}

export function getShopCost(gs, baseCost) {
  const base = Math.max(1, Math.floor(Number(baseCost) || 1));
  let mult = 1 + getAscension(gs) * 0.03;
  if ((gs?.runConfig?.curse || 'none') === 'tax') mult *= 1.2;

  if (typeof gs?.triggerItems === 'function') {
    const itemMult = gs.triggerItems('shop_price_mod', 1.0);
    if (typeof itemMult === 'number' && Number.isFinite(itemMult)) {
      mult *= itemMult;
    }
  }

  return Math.max(1, Math.ceil(base * mult));
}
