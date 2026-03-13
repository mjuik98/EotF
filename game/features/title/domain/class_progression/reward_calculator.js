import { toNonNegativeInt } from './xp_policy.js';

export function buildRunRewards(gs, outcome, options = {}) {
  const rewards = [];
  const isVictory = outcome === 'victory';
  const abandoned = !!options.abandoned;

  const baseXp = abandoned ? 24 : (isVictory ? 120 : 60);
  rewards.push({
    label: abandoned ? '런 포기' : (isVictory ? '런 승리' : '런 패배'),
    xp: baseXp,
  });

  const floor = Math.max(0, toNonNegativeInt(options.floor, toNonNegativeInt(gs?.currentFloor, 0)));
  const floorBonus = Math.min(80, floor * 8);
  if (floorBonus > 0) rewards.push({ label: `층 보너스 (${floor}층)`, xp: floorBonus });

  const kills = Math.max(0, toNonNegativeInt(options.kills, toNonNegativeInt(gs?.player?.kills, 0)));
  const killBonus = Math.min(60, kills * 3);
  if (killBonus > 0) rewards.push({ label: `처치 보너스 (${kills})`, xp: killBonus });

  const miniBossCleared = !!(options.miniBossCleared || gs?.combat?.miniBossDefeated);
  if (miniBossCleared) rewards.push({ label: '중간 보스 처치', xp: 36 });

  const bossCleared = isVictory || !!options.bossCleared || !!gs?.combat?.bossDefeated;
  if (bossCleared) rewards.push({ label: '지역 보스 처치', xp: 80 });

  const regionCount = Math.max(1, toNonNegativeInt(options.regionCount, 5));
  const cycle = Math.floor(Math.max(0, toNonNegativeInt(gs?.currentRegion, 0)) / regionCount);
  if (cycle > 0) rewards.push({ label: `사이클 보너스 (루프 ${cycle + 1})`, xp: Math.min(90, cycle * 18) });

  const ascension = toNonNegativeInt(
    options.ascension,
    toNonNegativeInt(gs?.meta?.runConfig?.ascension, 0),
  );
  if (ascension > 0) {
    const subTotal = rewards.reduce((sum, r) => sum + r.xp, 0);
    const bonusPct = ascension * 20;
    const bonusXp = Math.floor(subTotal * (bonusPct / 100));
    if (bonusXp > 0) {
      rewards.push({ label: `승천 보너스 (승천 ${ascension}, +${bonusPct}%)`, xp: bonusXp });
    }
  }

  return rewards;
}
