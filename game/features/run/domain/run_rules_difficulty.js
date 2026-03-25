import { getRegionCount } from './run_rules_regions.js';
import { getRunCurseDefinition } from './run_rules_curses.js';

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
  score += getRunCurseDefinition(cfg.curse).difficultyWeight || 0;
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
  const curseMul = getRunCurseDefinition(gs?.runConfig?.curse).enemyScaleMultiplier || 1;
  return ascMul * endlessMul * curseMul;
}

export function getHealAmount(gs, baseAmount) {
  const base = Math.max(0, Math.floor(Number(baseAmount) || 0));
  if (!base) return 0;
  let mult = 1 - getAscension(gs) * 0.02;
  mult *= getRunCurseDefinition(gs?.runConfig?.curse).healMultiplier || 1;
  return Math.max(0, Math.floor(base * Math.max(0.2, mult)));
}

export function getShopCost(gs, baseCost, options = {}) {
  const base = Math.max(1, Math.floor(Number(baseCost) || 1));
  let mult = 1 + getAscension(gs) * 0.03;
  mult *= getRunCurseDefinition(gs?.runConfig?.curse).shopCostMultiplier || 1;

  if (typeof gs?.triggerItems === 'function') {
    const itemMult = gs.triggerItems('shop_price_mod', {
      ...(options && typeof options === 'object' ? options : {}),
      multiplier: 1.0,
    });
    if (typeof itemMult === 'number' && Number.isFinite(itemMult)) {
      mult *= itemMult;
    } else if (itemMult && typeof itemMult === 'object' && Number.isFinite(itemMult.multiplier)) {
      mult *= itemMult.multiplier;
    }
  }

  return Math.max(1, Math.ceil(base * mult));
}
