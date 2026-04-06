import { RunRules, getBaseRegionIndex } from '../../run/ports/public_rule_capabilities.js';
import { getDifficultyMultiplier, scaleEnemyByMultiplier } from '../domain/difficulty_scaler_rules.js';
import { Logger } from '../ports/combat_logging.js';

const DifficultyScalerLogger = Logger.child('DifficultyScaler');

function hasExplicitDifficultyParams(paramsOrGs) {
  return Boolean(paramsOrGs && typeof paramsOrGs === 'object' && 'runCount' in paramsOrGs);
}

function resolveDifficultyScaleParams(paramsOrGs, region, floor) {
  if (hasExplicitDifficultyParams(paramsOrGs)) {
    return {
      region: paramsOrGs.region,
      floor: paramsOrGs.floor,
      ascension: paramsOrGs.ascension || 0,
      enemyScaleMultiplier: 1,
    };
  }

  const gs = paramsOrGs;
  const regionAbs = region !== undefined ? region : gs.currentRegion;
  return {
    region: typeof getBaseRegionIndex === 'function' ? getBaseRegionIndex(regionAbs) : regionAbs,
    floor: floor !== undefined ? floor : gs.currentFloor,
    ascension: gs?.runConfig?.ascension || 0,
    enemyScaleMultiplier: RunRules?.getEnemyScaleMultiplier
      ? RunRules.getEnemyScaleMultiplier(gs, regionAbs)
      : 1,
  };
}

export const DifficultyScaler = {
  getMultiplier(paramsOrGs, runCount, region, floor) {
    void runCount;
    return getDifficultyMultiplier(resolveDifficultyScaleParams(paramsOrGs, region, floor));
  },

  scaleEnemy(enemy, gs, runCount, region, floor) {
    void runCount;
    if (!gs) {
      DifficultyScalerLogger.warn('Missing game state, using base enemy');
      return { ...enemy };
    }

    const params = resolveDifficultyScaleParams(gs, region, floor);
    return scaleEnemyByMultiplier(enemy, {
      multiplier: getDifficultyMultiplier(params),
      ascension: params.ascension,
    });
  },
};
