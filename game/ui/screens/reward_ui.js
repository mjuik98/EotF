import { clearIdempotencyKey, clearIdempotencyPrefix, runIdempotent } from '../../utils/idempotency_utils.js';
import { ClassProgressionSystem } from '../../systems/class_progression_system.js';
import {
  applyRewardBlessing,
  applyRewardCard,
  applyRewardItem,
  applyRewardUpgrade,
  ensureMiniBossBonus,
} from './reward_ui_claims.js';
import {
  drawRewardCards,
  drawUniqueItems,
  getData,
  getDoc,
  getGS,
  getMaxEnergyCap,
  getRewardItemPool,
  normalizeRewardMode,
  RELIC_REWARD_CHANCE_BOSS,
  RELIC_REWARD_CHANCE_ELITE,
  RELIC_REWARD_CHANCE_MINIBOSS,
  RELIC_REWARD_CHANCE_NORMAL,
  resolveRewardCardConfig,
} from './reward_ui_helpers.js';
import {
  renderBlessingOption,
  renderItemOption,
  renderRewardCardOption,
  renderRewardHeader,
  setRewardPickedState,
  setSkipConfirmVisible,
} from './reward_ui_render.js';

const REWARD_CLAIM_KEY = 'reward:claim';
const REWARD_SKIP_KEY = 'reward:skip';

function finishReward(deps) {
  setTimeout(() => deps.returnToGame?.(true), 350);
}

function getRelicRewardChance(rewardMode, isElite) {
  if (rewardMode === 'boss') return RELIC_REWARD_CHANCE_BOSS;
  if (rewardMode === 'mini_boss') return RELIC_REWARD_CHANCE_MINIBOSS;
  if (isElite) return RELIC_REWARD_CHANCE_ELITE;
  return RELIC_REWARD_CHANCE_NORMAL;
}

function createBlessings(gs) {
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

function renderRewardCards(container, rewardCards, data, gs, deps) {
  rewardCards.forEach((cardId, idx) => {
    renderRewardCardOption(container, cardId, data, gs, deps, () => {
      RewardUI.takeRewardCard(cardId, deps);
    }, idx);
  });
}

function renderBlessingRewards(container, rewardMode, gs, deps, baseIndex) {
  const shouldOfferBlessing = rewardMode === 'boss' || (rewardMode === 'mini_boss' && Math.random() < 0.3);
  if (!shouldOfferBlessing) return 0;

  const blessings = createBlessings(gs);
  blessings.forEach((blessing, offset) => {
    renderBlessingOption(container, blessing, deps, () => {
      RewardUI.takeRewardBlessing(blessing, deps);
    }, baseIndex + offset);
  });
  return blessings.length;
}

function renderItemRewards(container, rewardMode, isElite, gs, data, deps, baseIndex) {
  const relicChance = getRelicRewardChance(rewardMode, isElite);
  if (Math.random() >= relicChance) return;

  const allAvailable = getRewardItemPool(gs, data, 'reward');
  let itemPool = [];

  if (rewardMode === 'boss') {
    itemPool = allAvailable.filter((item) => item.rarity === 'boss');
    if (itemPool.length === 0) {
      itemPool = allAvailable.filter((item) => ['legendary', 'rare'].includes(item.rarity));
    }
  } else {
    const nonBossPool = allAvailable.filter((item) => item.rarity !== 'boss');
    if (rewardMode === 'mini_boss') {
      itemPool = nonBossPool.filter((item) => ['rare', 'legendary'].includes(item.rarity));
    } else {
      itemPool = nonBossPool.filter((item) => ['common', 'uncommon'].includes(item.rarity));
    }
    if (itemPool.length === 0) itemPool = nonBossPool;
  }

  if (itemPool.length === 0) return;

  let totalChoices = 1 + Math.max(
    0,
    ClassProgressionSystem.getRewardRelicChoiceBonus(gs, { classIds: Object.keys(data?.classes || {}) })
  );
  if (typeof gs.triggerItems === 'function') {
    const result = gs.triggerItems('reward_generate', { type: 'item', count: totalChoices });
    if (typeof result === 'number' && Number.isFinite(result)) {
      totalChoices = Math.max(1, Math.floor(result));
    }
  }

  const pickedItems = drawUniqueItems(itemPool, totalChoices);
  pickedItems.forEach((item, offset) => {
    renderItemOption(container, item, deps, () => {
      RewardUI.takeRewardItem(item.id, deps);
    }, baseIndex + offset);
  });
}

export const RewardUI = {
  showRewardScreen(mode = false, deps = {}) {
    const gs = getGS(deps);
    const data = getData(deps);
    if (!gs || !data) return;

    const rewardMode = normalizeRewardMode(mode);
    const isElite = gs.currentNode?.type === 'elite';
    const { count, rarities } = resolveRewardCardConfig(rewardMode, isElite);

    if (gs.combat?.active) gs.combat.active = false;

    gs._rewardLock = false;
    clearIdempotencyPrefix('reward:');
    this.hideSkipConfirm(deps);

    if (rewardMode === 'mini_boss') {
      ensureMiniBossBonus(gs, data, deps);
    }

    const rewardCards = drawRewardCards(gs, count, rarities);
    const doc = getDoc(deps);
    const container = doc.getElementById('rewardCards');
    if (!container) return;

    renderRewardHeader(doc, rewardMode, isElite);
    container.textContent = '';
    container.classList.remove('picked');

    renderRewardCards(container, rewardCards, data, gs, deps);
    const blessingCount = renderBlessingRewards(container, rewardMode, gs, deps, rewardCards.length);
    renderItemRewards(container, rewardMode, isElite, gs, data, deps, rewardCards.length + blessingCount);

    deps.switchScreen?.('reward');
  },

  takeRewardBlessing(blessing, deps = {}) {
    const gs = getGS(deps);
    if (!gs) return;

    return runIdempotent(REWARD_CLAIM_KEY, () => {
      if (gs._rewardLock) return;
      if (blessing.type === 'energy' && (gs.player.maxEnergy || 0) >= getMaxEnergyCap(gs)) {
        deps.audioEngine?.playHit?.();
        return;
      }

      gs._rewardLock = true;
      setRewardPickedState(getDoc(deps), true);
      applyRewardBlessing(gs, blessing);

      deps.playItemGet?.();
      deps.showItemToast?.({ name: blessing.name, icon: blessing.icon, desc: blessing.desc });
      finishReward(deps);
    }, { ttlMs: 3000 });
  },

  takeRewardCard(cardId, deps = {}) {
    const gs = getGS(deps);
    const data = getData(deps);
    if (!gs || !data) return;

    return runIdempotent(REWARD_CLAIM_KEY, () => {
      if (gs._rewardLock) return;
      gs._rewardLock = true;
      setRewardPickedState(getDoc(deps), true);

      const card = applyRewardCard(gs, data, cardId);
      deps.playItemGet?.();
      deps.showItemToast?.({ name: card?.name || cardId, icon: card?.icon || '*', desc: card?.desc || '' });
      finishReward(deps);
    }, { ttlMs: 3000 });
  },

  takeRewardItem(itemKey, deps = {}) {
    const gs = getGS(deps);
    const data = getData(deps);
    if (!gs || !data) return;

    return runIdempotent(REWARD_CLAIM_KEY, () => {
      if (gs._rewardLock) return;
      gs._rewardLock = true;
      setRewardPickedState(getDoc(deps), true);

      const item = applyRewardItem(gs, data, itemKey);
      deps.playItemGet?.();
      deps.showItemToast?.(item, { forceQueue: true });
      finishReward(deps);
    }, { ttlMs: 3000 });
  },

  takeRewardUpgrade(deps = {}) {
    const gs = getGS(deps);
    const data = getData(deps);
    if (!gs || !data) return;

    return runIdempotent(REWARD_CLAIM_KEY, () => {
      if (gs._rewardLock) return;
      const upgradedId = applyRewardUpgrade(gs, data);
      if (!upgradedId) {
        deps.audioEngine?.playHit?.();
        return;
      }

      gs._rewardLock = true;
      deps.playItemGet?.();
      deps.showItemToast?.({
        name: `Upgrade complete: ${data.cards?.[upgradedId]?.name || upgradedId}`,
        icon: 'UP',
        desc: 'A random card has been upgraded.',
      });
      finishReward(deps);
    }, { ttlMs: 3000 });
  },

  takeRewardRemove(deps = {}) {
    const gs = getGS(deps);
    if (!gs) return;

    return runIdempotent(REWARD_CLAIM_KEY, () => {
      if (gs._rewardLock) return;
      gs._rewardLock = true;

      const doc = getDoc(deps);
      setRewardPickedState(doc, true);
      const eventUI = deps.EventUI;

      if (eventUI && typeof eventUI.showCardDiscard === 'function') {
        eventUI.showCardDiscard(gs, true, {
          ...deps,
          onCancel: () => {
            gs._rewardLock = false;
            clearIdempotencyKey(REWARD_CLAIM_KEY);
            setRewardPickedState(doc, false);
          },
          returnToGame: (force) => deps.returnToGame?.(force),
        });
        return;
      }

      deps.returnToGame?.(true);
    }, { ttlMs: 3000 });
  },

  showSkipConfirm(deps = {}) {
    setSkipConfirmVisible(getDoc(deps), true);
  },

  hideSkipConfirm(deps = {}) {
    setSkipConfirmVisible(getDoc(deps), false);
  },

  skipReward(deps = {}) {
    const gs = getGS(deps);
    if (!gs) return;

    return runIdempotent(REWARD_SKIP_KEY, () => {
      if (gs._rewardLock) return;
      gs._rewardLock = true;
      deps.returnToGame?.(true);
    }, { ttlMs: 3000 });
  },
};
