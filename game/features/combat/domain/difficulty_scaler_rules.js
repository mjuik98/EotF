import { CONSTANTS } from '../../../data/constants.js';

function normalizeFiniteNumber(value, fallback) {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : fallback;
}

export function getDifficultyMultiplier({
  region = 0,
  floor = 0,
  enemyScaleMultiplier = 1,
} = {}) {
  const difficulty = CONSTANTS.DIFFICULTY;
  const normalizedRegion = normalizeFiniteNumber(region, 0);
  const normalizedFloor = normalizeFiniteNumber(floor, 0);
  const normalizedScale = normalizeFiniteNumber(enemyScaleMultiplier, 1);
  let base = 1 + normalizedRegion * difficulty.REGION_SCALE + normalizedFloor * difficulty.FLOOR_SCALE;
  const cap = difficulty.BASE_MULTIPLIER_CAP || 3.0;
  if (base > cap) base = cap;
  return base * normalizedScale;
}

export function scaleEnemyByMultiplier(enemy, {
  multiplier = 1,
  ascension = 0,
} = {}) {
  const normalizedMultiplier = normalizeFiniteNumber(multiplier, 1);
  const normalizedAscension = normalizeFiniteNumber(ascension, 0);
  const ascGoldScale = CONSTANTS.DIFFICULTY.ASCENSION_GOLD_SCALE;

  return {
    ...enemy,
    hp: Math.ceil(enemy.hp * normalizedMultiplier),
    maxHp: Math.ceil(enemy.maxHp * normalizedMultiplier),
    atk: Math.ceil(enemy.atk * normalizedMultiplier),
    xp: Math.ceil(enemy.xp * normalizedMultiplier),
    gold: Math.max(1, Math.ceil((enemy.gold || 0) * (1 + (normalizedAscension * ascGoldScale)))),
    isBoss: enemy.isBoss || false,
    maxPhase: enemy.maxPhase || 1,
    phase: enemy.phase || 1,
    isElite: enemy.isElite || false,
    statusEffects: enemy.statusEffects || {},
  };
}
