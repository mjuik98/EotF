import { CONSTANTS } from '../../../data/constants.js';
import { RunRules, getBaseRegionIndex } from '../../run/ports/public_rule_capabilities.js';

export const DifficultyScaler = {
  getMultiplier(paramsOrGs, runCount, region, floor) {
    let run;
    let reg;
    let flr;
    let ascension;

    if (paramsOrGs && typeof paramsOrGs === 'object' && 'runCount' in paramsOrGs) {
      run = paramsOrGs.runCount;
      reg = paramsOrGs.region;
      flr = paramsOrGs.floor;
      ascension = paramsOrGs.ascension || 0;
    } else {
      const gs = paramsOrGs;
      run = runCount !== undefined ? runCount : gs.meta.runCount;
      const regAbs = region !== undefined ? region : gs.currentRegion;
      reg = typeof getBaseRegionIndex === 'function' ? getBaseRegionIndex(regAbs) : regAbs;
      flr = floor !== undefined ? floor : gs.currentFloor;
      ascension = gs?.runConfig?.ascension || 0;
    }

    const _ = run;
    void _;

    const difficulty = CONSTANTS.DIFFICULTY;
    let base = 1 + reg * difficulty.REGION_SCALE + flr * difficulty.FLOOR_SCALE;
    const cap = difficulty.BASE_MULTIPLIER_CAP || 3.0;
    if (base > cap) base = cap;

    if (typeof paramsOrGs === 'object' && !('runCount' in paramsOrGs) && RunRules?.getEnemyScaleMultiplier) {
      const regAbs = region !== undefined ? region : paramsOrGs.currentRegion;
      return base * RunRules.getEnemyScaleMultiplier(paramsOrGs, regAbs);
    }
    return base * (1 + ascension * 0);
  },

  scaleEnemy(enemy, gs, runCount, region, floor) {
    if (!gs) {
      console.warn('[DifficultyScaler] gs is undefined, using base enemy');
      return { ...enemy };
    }
    const m = this.getMultiplier(gs, runCount, region, floor);
    const ascGoldScale = CONSTANTS.DIFFICULTY.ASCENSION_GOLD_SCALE;
    return {
      ...enemy,
      hp: Math.ceil(enemy.hp * m),
      maxHp: Math.ceil(enemy.maxHp * m),
      atk: Math.ceil(enemy.atk * m),
      xp: Math.ceil(enemy.xp * m),
      gold: Math.max(1, Math.ceil((enemy.gold || 0) * (1 + ((gs?.runConfig?.ascension || 0) * ascGoldScale)))),
      isBoss: enemy.isBoss || false,
      maxPhase: enemy.maxPhase || 1,
      phase: enemy.phase || 1,
      isElite: enemy.isElite || false,
      statusEffects: enemy.statusEffects || {},
    };
  },
};
