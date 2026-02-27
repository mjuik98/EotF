import { CONSTANTS } from '../data/constants.js';
import { RunRules, getBaseRegionIndex } from '../systems/run_rules.js';

// DifficultyScaler — 순수 함수화 (GS 없이 밸런스 시뮬레이션 가능)
export const DifficultyScaler = {
  /**
   * 난이도 배율을 계산합니다.
   * @param {Object} params - { runCount, region, floor, ascension }
   *   또는 하위 호환: (gs, runCount, region, floor)
   * @returns {number} 배율
   */
  getMultiplier(paramsOrGs, runCount, region, floor) {
    let run, reg, flr, ascension;

    // 순수 함수 호출: getMultiplier({ runCount, region, floor, ascension })
    if (paramsOrGs && typeof paramsOrGs === 'object' && 'runCount' in paramsOrGs) {
      run = paramsOrGs.runCount;
      reg = paramsOrGs.region;
      flr = paramsOrGs.floor;
      ascension = paramsOrGs.ascension || 0;
    }
    // 하위 호환: getMultiplier(gs, runCount, region, floor)
    else {
      const gs = paramsOrGs;
      run = runCount !== undefined ? runCount : gs.meta.runCount;
      const regAbs = region !== undefined ? region : gs.currentRegion;
      reg = (typeof getBaseRegionIndex === 'function') ? getBaseRegionIndex(regAbs) : regAbs;
      flr = floor !== undefined ? floor : gs.currentFloor;
      ascension = gs?.runConfig?.ascension || 0;
    }

    const D = CONSTANTS.DIFFICULTY;
    let base = 1 + (run - 1) * D.RUN_SCALE + reg * D.REGION_SCALE + flr * D.FLOOR_SCALE;

    // 밸런스 조정: 베이스 배율 캡 적용 (기본 3.0)
    const cap = D.BASE_MULTIPLIER_CAP || 3.0;
    if (base > cap) base = cap;

    // 하위 호환: RunRules가 있으면 적용
    if (typeof paramsOrGs === 'object' && !('runCount' in paramsOrGs) &&
      typeof RunRules !== 'undefined' && RunRules?.getEnemyScaleMultiplier) {
      const regAbs = region !== undefined ? region : paramsOrGs.currentRegion;
      return base * RunRules.getEnemyScaleMultiplier(paramsOrGs, regAbs);
    }
    return base;
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
      hp: Math.ceil(enemy.hp * m), maxHp: Math.ceil(enemy.maxHp * m),
      atk: Math.ceil(enemy.atk * m), xp: Math.ceil(enemy.xp * m),
      gold: Math.max(1, Math.ceil((enemy.gold || 0) * (1 + ((gs?.runConfig?.ascension || 0) * ascGoldScale)))),
      // isBoss, maxPhase, phase 등 모든 속성 유지
      isBoss: enemy.isBoss || false,
      maxPhase: enemy.maxPhase || 1,
      phase: enemy.phase || 1,
      isElite: enemy.isElite || false,
      statusEffects: enemy.statusEffects || {},
    };
  },
};
