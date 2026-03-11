import {
  buildRewardOptionsUseCase,
  createRewardBlessings as createRewardBlessingsUseCase,
  getRelicRewardChance as getRelicRewardChanceUseCase,
} from '../../app/reward/use_cases/build_reward_options_use_case.js';
import {
  renderBlessingOption,
  renderItemOption,
  renderRewardCardOption,
} from './reward_ui_render.js';

export function getRelicRewardChance(rewardMode, isElite) {
  return getRelicRewardChanceUseCase(rewardMode, isElite);
}

export function createRewardBlessings(gs) {
  return createRewardBlessingsUseCase(gs);
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
  const rewardOptions = buildRewardOptionsUseCase({
    data,
    gs,
    isElite,
    rewardCards: [],
    rewardMode,
  });
  const pickedItems = rewardOptions.items;
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
  const rewardOptions = buildRewardOptionsUseCase({
    container,
    data,
    gs,
    isElite,
    rewardCards,
    rewardMode,
  });

  renderRewardCardOptions(container, rewardOptions.rewardCards, data, gs, deps, onTakeCard);
  rewardOptions.blessings.forEach((blessing, offset) => {
    renderBlessingOption(container, blessing, deps, () => onTakeBlessing(blessing), rewardCards.length + offset);
  });
  rewardOptions.items.forEach((item, offset) => {
    renderItemOption(
      container,
      item,
      deps,
      () => onTakeItem(item.id),
      rewardCards.length + rewardOptions.blessings.length + offset,
    );
  });
  return rewardOptions.items.length;
}
