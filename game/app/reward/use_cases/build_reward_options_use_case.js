import { CONSTANTS } from '../../../data/constants.js';
import { ClassProgressionSystem } from '../../../systems/class_progression_system.js';

export const RELIC_REWARD_CHANCE_NORMAL = 0;
export const RELIC_REWARD_CHANCE_ELITE = 0.1;
export const RELIC_REWARD_CHANCE_MINIBOSS = 0.25;
export const RELIC_REWARD_CHANCE_BOSS = 0.5;

export function getRewardMaxEnergyCap(gs) {
  const overrideCap = Number(gs?.player?.maxEnergyCap);
  if (Number.isFinite(overrideCap) && overrideCap >= 1) return Math.floor(overrideCap);
  const configCap = Number(CONSTANTS?.PLAYER?.MAX_ENERGY_CAP);
  if (Number.isFinite(configCap) && configCap >= 1) return Math.floor(configCap);
  return 5;
}

export function getRelicRewardChance(rewardMode, isElite) {
  if (rewardMode === 'boss') return RELIC_REWARD_CHANCE_BOSS;
  if (rewardMode === 'mini_boss') return RELIC_REWARD_CHANCE_MINIBOSS;
  if (isElite) return RELIC_REWARD_CHANCE_ELITE;
  return RELIC_REWARD_CHANCE_NORMAL;
}

export function createRewardBlessings(gs) {
  const maxEnergyCap = getRewardMaxEnergyCap(gs);
  const isEnergyCapReached = (gs.player.maxEnergy || 0) >= maxEnergyCap;
  return [
    {
      id: 'blessing_hp',
      name: 'Vital Blessing',
      icon: 'HP',
      desc: 'Increase max HP by 20 permanently.',
      type: 'hp',
      amount: 20,
    },
    {
      id: 'blessing_energy',
      name: 'Energy Blessing',
      icon: 'EN',
      desc: 'Increase max Energy by 1 permanently.',
      type: 'energy',
      amount: 1,
      disabled: isEnergyCapReached,
      disabledReason: `Already at maximum energy (${maxEnergyCap}).`,
    },
  ];
}

function isItemObtainableFrom(item, source = 'reward') {
  const routes = item?.obtainableFrom;
  if (!Array.isArray(routes) || routes.length === 0) return true;
  return routes.includes(source);
}

function getRewardItemPool(gs, data, source = 'reward') {
  return Object.values(data.items || {}).filter((item) => {
    return !(gs.player.items || []).includes(item.id) && isItemObtainableFrom(item, source);
  });
}

function drawUniqueItems(pool, count) {
  if (!Array.isArray(pool) || pool.length === 0 || count <= 0) return [];
  const available = [...pool];
  const picked = [];
  const target = Math.min(available.length, Math.max(0, Math.floor(count)));
  for (let i = 0; i < target; i += 1) {
    const idx = Math.floor(Math.random() * available.length);
    const [item] = available.splice(idx, 1);
    if (item) picked.push(item);
  }
  return picked;
}

function resolveRewardItemPool(rewardMode, gs, data) {
  const allAvailable = getRewardItemPool(gs, data, 'reward');
  if (rewardMode === 'boss') {
    const bossPool = allAvailable.filter((item) => item.rarity === 'boss');
    if (bossPool.length > 0) return bossPool;
    return allAvailable.filter((item) => ['legendary', 'rare'].includes(item.rarity));
  }

  const nonBossPool = allAvailable.filter((item) => item.rarity !== 'boss');
  if (rewardMode === 'mini_boss') {
    const miniBossPool = nonBossPool.filter((item) => ['rare', 'legendary'].includes(item.rarity));
    if (miniBossPool.length > 0) return miniBossPool;
  } else {
    const normalPool = nonBossPool.filter((item) => ['common', 'uncommon'].includes(item.rarity));
    if (normalPool.length > 0) return normalPool;
  }

  return nonBossPool;
}

function resolveRewardItemChoiceCount(gs, data) {
  let totalChoices = 1 + Math.max(
    0,
    ClassProgressionSystem.getRewardRelicChoiceBonus(gs, { classIds: Object.keys(data?.classes || {}) }),
  );
  if (typeof gs.triggerItems === 'function') {
    const result = gs.triggerItems('reward_generate', { type: 'item', count: totalChoices });
    if (typeof result === 'number' && Number.isFinite(result)) {
      totalChoices = Math.max(1, Math.floor(result));
    }
  }
  return totalChoices;
}

export function buildRewardOptionsUseCase({
  rewardMode,
  isElite,
  rewardCards,
  data,
  gs,
} = {}) {
  const shouldOfferBlessing = rewardMode === 'boss' || (rewardMode === 'mini_boss' && Math.random() < 0.3);
  const blessings = shouldOfferBlessing ? createRewardBlessings(gs) : [];

  const relicChance = getRelicRewardChance(rewardMode, isElite);
  if (Math.random() >= relicChance) {
    return {
      rewardCards,
      blessings,
      items: [],
    };
  }

  const itemPool = resolveRewardItemPool(rewardMode, gs, data);
  if (itemPool.length === 0) {
    return {
      rewardCards,
      blessings,
      items: [],
    };
  }

  const totalChoices = resolveRewardItemChoiceCount(gs, data);
  return {
    rewardCards,
    blessings,
    items: drawUniqueItems(itemPool, totalChoices),
  };
}
