import { ClassProgressionSystem } from '../../systems/class_progression_system.js';
import {
  drawUniqueItems,
  getMaxEnergyCap,
  getRewardItemPool,
  RELIC_REWARD_CHANCE_BOSS,
  RELIC_REWARD_CHANCE_ELITE,
  RELIC_REWARD_CHANCE_MINIBOSS,
  RELIC_REWARD_CHANCE_NORMAL,
} from './reward_ui_helpers.js';
import {
  renderBlessingOption,
  renderItemOption,
  renderRewardCardOption,
} from './reward_ui_render.js';

export function getRelicRewardChance(rewardMode, isElite) {
  if (rewardMode === 'boss') return RELIC_REWARD_CHANCE_BOSS;
  if (rewardMode === 'mini_boss') return RELIC_REWARD_CHANCE_MINIBOSS;
  if (isElite) return RELIC_REWARD_CHANCE_ELITE;
  return RELIC_REWARD_CHANCE_NORMAL;
}

export function createRewardBlessings(gs) {
  const maxEnergyCap = getMaxEnergyCap(gs);
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

export function renderRewardCardOptions(container, rewardCards, data, gs, deps, onTakeCard) {
  rewardCards.forEach((cardId, idx) => {
    renderRewardCardOption(container, cardId, data, gs, deps, () => onTakeCard(cardId), idx);
  });
}

export function renderBlessingRewardOptions(container, rewardMode, gs, deps, onTakeBlessing, baseIndex = 0) {
  const shouldOfferBlessing = rewardMode === 'boss' || (rewardMode === 'mini_boss' && Math.random() < 0.3);
  if (!shouldOfferBlessing) return 0;

  const blessings = createRewardBlessings(gs);
  blessings.forEach((blessing, offset) => {
    renderBlessingOption(container, blessing, deps, () => onTakeBlessing(blessing), baseIndex + offset);
  });
  return blessings.length;
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

export function renderItemRewardOptions(
  container,
  rewardMode,
  isElite,
  gs,
  data,
  deps,
  onTakeItem,
  baseIndex = 0,
) {
  const relicChance = getRelicRewardChance(rewardMode, isElite);
  if (Math.random() >= relicChance) return 0;

  const itemPool = resolveRewardItemPool(rewardMode, gs, data);
  if (itemPool.length === 0) return 0;

  const totalChoices = resolveRewardItemChoiceCount(gs, data);
  const pickedItems = drawUniqueItems(itemPool, totalChoices);
  pickedItems.forEach((item, offset) => {
    renderItemOption(container, item, deps, () => onTakeItem(item.id), baseIndex + offset);
  });
  return pickedItems.length;
}

export function renderRewardOptions({
  container,
  rewardMode,
  isElite,
  rewardCards,
  data,
  gs,
  deps,
  onTakeCard,
  onTakeBlessing,
  onTakeItem,
}) {
  renderRewardCardOptions(container, rewardCards, data, gs, deps, onTakeCard);
  const blessingCount = renderBlessingRewardOptions(
    container,
    rewardMode,
    gs,
    deps,
    onTakeBlessing,
    rewardCards.length,
  );
  return renderItemRewardOptions(
    container,
    rewardMode,
    isElite,
    gs,
    data,
    deps,
    onTakeItem,
    rewardCards.length + blessingCount,
  );
}
