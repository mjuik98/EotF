// Difficulty Scaler extraction: logic moved from data/game_data.js
const DifficultyScaler = {
  getMultiplier(gs, runCount, region, floor) {
    const run = runCount !== undefined ? runCount : gs.meta.runCount;
    const regAbs = region !== undefined ? region : gs.currentRegion;
    const reg = (typeof getBaseRegionIndex === 'function') ? getBaseRegionIndex(regAbs) : regAbs;
    const flr = floor !== undefined ? floor : gs.currentFloor;
    const base = 1 + (run - 1) * 0.05 + reg * 0.10 + flr * 0.03;
    if (typeof RunRules !== 'undefined' && RunRules?.getEnemyScaleMultiplier) {
      return base * RunRules.getEnemyScaleMultiplier(gs, regAbs);
    }
    return base;
  },
  scaleEnemy(enemy, gs, runCount, region, floor) {
    const m = this.getMultiplier(gs, runCount, region, floor);
    return {
      ...enemy,
      hp: Math.ceil(enemy.hp * m), maxHp: Math.ceil(enemy.maxHp * m),
      atk: Math.ceil(enemy.atk * m), xp: Math.ceil(enemy.xp * m),
      gold: Math.max(1, Math.ceil((enemy.gold || 0) * (1 + (((gs?.runConfig?.ascension || 0) * 0.02))))),
    };
  },
};
