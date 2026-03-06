import { clearIdempotencyKey, clearIdempotencyPrefix, runIdempotent } from '../../utils/idempotency_utils.js';

import { ClassProgressionSystem } from '../../systems/class_progression_system.js';
import { registerCardDiscovered, registerItemFound } from '../../systems/codex_records_system.js';
import { CONSTANTS } from '../../data/constants.js';
import { RARITY_LABELS } from '../../../data/rarity_meta.js';

function _getDoc(deps) {
  return deps?.doc || document;
}

function _getGS(deps) {
  return deps?.gs;
}

function _getData(deps) {
  return deps?.data;
}

function _getMaxEnergyCap(gs) {
  const overrideCap = Number(gs?.player?.maxEnergyCap);
  if (Number.isFinite(overrideCap) && overrideCap >= 1) return Math.floor(overrideCap);
  const configCap = Number(CONSTANTS?.PLAYER?.MAX_ENERGY_CAP);
  if (Number.isFinite(configCap) && configCap >= 1) return Math.floor(configCap);
  return 5;
}

function _getDescriptionUtils(deps) {
  return deps?.DescriptionUtils || globalThis.DescriptionUtils || null;
}

function _normalizeRewardMode(mode) {
  if (mode === true) return 'boss';
  if (mode === false || mode == null) return 'normal';
  if (typeof mode === 'string') return mode;
  return 'normal';
}

const RELIC_REWARD_CHANCE_NORMAL = 0.15;
const RELIC_REWARD_CHANCE_ELITE = 0.2;

function _drawRewardCards(gs, count, rarities) {
  const out = [];
  const used = new Set();
  for (let i = 0; i < count; i++) {
    const rarity = rarities[Math.min(i, rarities.length - 1)] || 'common';
    let cardId = gs.getRandomCard?.(rarity);
    let guard = 0;
    while (cardId && used.has(cardId) && guard < 10) {
      cardId = gs.getRandomCard?.(rarity);
      guard += 1;
    }
    if (!cardId) continue;
    used.add(cardId);
    out.push(cardId);
  }
  return out;
}

function _toRarityLabel(rarity) {
  const key = String(rarity || 'common');
  return RARITY_LABELS[key] || RARITY_LABELS.common;
}

function _toTypeClass(type) {
  if (!type) return '';
  const t = String(type).toLowerCase();
  if (t === 'attack') return 'type-attack';
  if (t === 'skill') return 'type-skill';
  if (t === 'power') return 'type-power';
  return '';
}

function _isItemObtainableFrom(item, source = 'reward') {
  const routes = item?.obtainableFrom;
  if (!Array.isArray(routes) || routes.length === 0) return true;
  return routes.includes(source);
}

function _getRewardItemPool(gs, data, source = 'reward') {
  return Object.values(data.items || {}).filter((item) => {
    return !gs.player.items.includes(item.id) && _isItemObtainableFrom(item, source);
  });
}
function _drawUniqueItems(pool, count) {
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

function _markRewardSelection(container, wrapper) {
  if (!container || !wrapper) return;
  container.querySelectorAll('.reward-card-wrapper.selected').forEach((el) => el.classList.remove('selected'));
  wrapper.classList.add('selected');
}

function _ensureMiniBossBonus(gs, data, deps) {
  const heal = Math.max(1, Math.floor((gs.player.maxHp || 1) * 0.15));
  const hpBefore = gs.player.hp || 0;
  gs.player.hp = Math.min(gs.player.maxHp || 1, hpBefore + heal);

  const goldGain = Math.max(12, Math.floor((gs.currentRegion + 1) * 6));
  gs.player.gold = (gs.player.gold || 0) + goldGain;
  gs.addLog?.(`🔥 중간 보스 보상: 골드 +${goldGain}, HP +${gs.player.hp - hpBefore}`, 'system');

  const rareItems = Object.values(data.items || {}).filter((item) => {
    return (item.rarity === 'rare' || item.rarity === 'legendary')
      && !gs.player.items.includes(item.id)
      && _isItemObtainableFrom(item, 'reward');
  });
  if (rareItems.length > 0) {
    const guaranteed = rareItems[Math.floor(Math.random() * rareItems.length)];
    gs.player.items.push(guaranteed.id);
    registerItemFound(gs, guaranteed.id);
    gs.addLog?.(`🔥 중간 보스 유물 획득: ${guaranteed.icon || '💎'} ${guaranteed.name}`, 'system');
  }
}

function _renderRewardCardOption(container, cardId, data, deps, onPick, idx) {
  const doc = _getDoc(deps);
  const card = data.cards?.[cardId];
  if (!card) return;

  const wrapper = doc.createElement('button');
  wrapper.type = 'button';
  wrapper.className = 'reward-card-wrapper';
  wrapper.style.animationDelay = `${idx * 0.08}s`;
  wrapper.setAttribute('aria-label', `${card.name || cardId} 카드 선택`);

  const cardEl = doc.createElement('div');
  const rarityClass = `rarity-${card.rarity || 'common'}`;
  const typeClass = _toTypeClass(card.type);
  cardEl.className = `card ${rarityClass} ${typeClass}`.trim();
  cardEl.style.cssText = 'width:170px;height:260px;padding:14px;display:flex;flex-direction:column;gap:8px;';

  const cost = doc.createElement('div');
  cost.className = 'card-cost';
  cost.textContent = String(card.cost ?? 1);

  const icon = doc.createElement('div');
  icon.className = 'card-icon';
  icon.style.fontSize = '36px';
  icon.textContent = card.icon || '🃏';

  const name = doc.createElement('div');
  name.className = 'card-name reward-card-name';
  name.textContent = card.name || cardId;

  const desc = doc.createElement('div');
  desc.className = 'card-desc reward-card-desc';
  const DescriptionUtils = _getDescriptionUtils(deps);
  if (DescriptionUtils) {
    desc.innerHTML = DescriptionUtils.highlight(card.desc || '');
  } else {
    desc.textContent = card.desc || '';
  }

  const rarity = doc.createElement('div');
  rarity.className = `card-type reward-card-type ${rarityClass}`.trim();
  rarity.textContent = _toRarityLabel(card.rarity);

  cardEl.append(cost, icon, name, desc, rarity);
  wrapper.appendChild(cardEl);
  wrapper.addEventListener('click', () => {
    _markRewardSelection(container, wrapper);
    onPick?.();
  });
  container.appendChild(wrapper);
}

function _renderItemOption(container, item, deps, onPick, idx) {
  const doc = _getDoc(deps);
  if (!item) return;

  const wrapper = doc.createElement('button');
  wrapper.type = 'button';
  wrapper.className = 'reward-card-wrapper';
  wrapper.style.animationDelay = `${idx * 0.08}s`;
  wrapper.setAttribute('aria-label', `${item.name || item.id} 아이템 선택`);

  const cardEl = doc.createElement('div');
  const rarityClass = `rarity-${item.rarity || 'common'}`;
  cardEl.className = `card ${rarityClass}`;
  cardEl.style.cssText = 'width:170px;height:260px;padding:14px;display:flex;flex-direction:column;gap:8px;border-color:var(--gold);';

  const icon = doc.createElement('div');
  icon.className = 'card-icon';
  icon.style.fontSize = '40px';
  icon.textContent = item.icon || '🎁';

  const name = doc.createElement('div');
  name.className = 'card-name reward-card-name';
  name.textContent = item.name || item.id;

  const desc = doc.createElement('div');
  desc.className = 'card-desc reward-card-desc';
  const DescriptionUtils = _getDescriptionUtils(deps);
  if (DescriptionUtils) {
    desc.innerHTML = DescriptionUtils.highlight(item.desc || '');
  } else {
    desc.textContent = item.desc || '';
  }

  const rarity = doc.createElement('div');
  rarity.className = `card-type reward-card-type ${rarityClass}`.trim();
  rarity.textContent = `아이템 · ${_toRarityLabel(item.rarity)}`;

  cardEl.append(icon, name, desc, rarity);
  wrapper.appendChild(cardEl);
  wrapper.addEventListener('click', () => {
    _markRewardSelection(container, wrapper);
    onPick?.();
  });
  container.appendChild(wrapper);
}

function _renderBlessingOption(container, blessing, deps, onPick, idx) {
  const doc = _getDoc(deps);
  if (!blessing) return;
  const isDisabled = !!blessing.disabled;

  const wrapper = doc.createElement('button');
  wrapper.type = 'button';
  wrapper.className = 'reward-card-wrapper';
  wrapper.classList.add('reward-blessing-option');
  if (blessing.type) wrapper.classList.add(`reward-blessing-${blessing.type}`);
  wrapper.style.animationDelay = `${idx * 0.08}s`;
  wrapper.setAttribute('aria-label', `${blessing.name} 축복 선택`);
  if (isDisabled) {
    wrapper.disabled = true;
    wrapper.setAttribute('aria-disabled', 'true');
    wrapper.classList.add('is-disabled');
    if (blessing.type === 'energy') wrapper.classList.add('reward-permanent-energy-disabled');
    if (blessing.disabledReason) wrapper.title = blessing.disabledReason;
  }

  const cardEl = doc.createElement('div');
  cardEl.className = 'card rarity-rare'; // 축복은 희귀 등급 스타일 적용
  cardEl.classList.add('reward-blessing-card');
  cardEl.style.cssText = 'width:170px;height:260px;padding:14px;display:flex;flex-direction:column;gap:8px;border-color:var(--glow);box-shadow: 0 0 15px var(--glow);';

  const icon = doc.createElement('div');
  icon.className = 'card-icon';
  icon.style.fontSize = '40px';
  icon.textContent = blessing.icon || '✨';

  const name = doc.createElement('div');
  name.className = 'card-name reward-card-name';
  name.textContent = blessing.name;

  const desc = doc.createElement('div');
  desc.className = 'card-desc reward-card-desc';
  desc.textContent = blessing.desc;

  const type = doc.createElement('div');
  type.className = 'card-type reward-card-type rarity-rare';
  type.textContent = '축복';

  cardEl.append(icon, name, desc, type);
  if (isDisabled && blessing.type === 'energy') {
    const overlay = doc.createElement('div');
    overlay.className = 'reward-disabled-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    const badge = doc.createElement('div');
    badge.className = 'reward-disabled-state-badge';
    badge.textContent = '최대치 도달';

    const reason = doc.createElement('div');
    reason.className = 'reward-disabled-reason';
    reason.textContent = blessing.disabledReason || '선택할 수 없습니다.';

    cardEl.append(overlay, badge, reason);
  }
  wrapper.appendChild(cardEl);
  if (!isDisabled) {
    wrapper.addEventListener('click', () => {
      _markRewardSelection(container, wrapper);
      onPick?.();
    });
  }
  container.appendChild(wrapper);
}

const REWARD_CLAIM_KEY = 'reward:claim';
const REWARD_SKIP_KEY = 'reward:skip';

export const RewardUI = {
  showRewardScreen(mode = false, deps = {}) {
    const gs = _getGS(deps);
    const data = _getData(deps);
    if (!gs || !data) return;

    const rewardMode = _normalizeRewardMode(mode);
    const isBoss = rewardMode === 'boss';
    const isMiniBoss = rewardMode === 'mini_boss';
    const isElite = gs.currentNode?.type === 'elite';

    if (gs.combat?.active) gs.combat.active = false;

    gs._rewardLock = false;
    clearIdempotencyPrefix('reward:');
    this.hideSkipConfirm(deps);

    if (isMiniBoss) {
      _ensureMiniBossBonus(gs, data, deps);
    }

    const count = isBoss ? 4 : (isMiniBoss ? 2 : 3);
    const rarities = isBoss
      ? ['uncommon', 'uncommon', 'rare', 'rare']
      : (isMiniBoss
        ? ['uncommon', 'rare']
        : (isElite ? ['uncommon', 'uncommon', 'rare'] : ['common', 'uncommon', 'common']));
    const rewardCards = _drawRewardCards(gs, count, rarities);

    const doc = _getDoc(deps);
    const eyebrow = doc.getElementById('rewardEyebrow');
    const titleEl = doc.getElementById('rewardTitle');
    const container = doc.getElementById('rewardCards');
    if (!container) return;

    if (eyebrow) {
      eyebrow.textContent = isBoss
        ? '✦ 보스 처치 — 보상 선택 ✦'
        : (isMiniBoss ? '✦ 중간 보스 처치 — 보상 선택 ✦' : (isElite ? '✦ 정예 처치 — 보상 선택 ✦' : '✦ 전투 승리 — 보상 선택 ✦'));
    }

    if (titleEl) {
      if (isBoss) {
        titleEl.textContent = '👑 보스 처치!';
        titleEl.style.display = 'block';
        titleEl.style.color = 'var(--gold)';
      } else if (isMiniBoss) {
        titleEl.textContent = '🔥 중간 보스 처치!';
        titleEl.style.display = 'block';
        titleEl.style.color = '#ff7a33';
      } else if (isElite) {
        titleEl.textContent = '⚔️ 정예 처치!';
        titleEl.style.display = 'block';
        titleEl.style.color = '#d4a017';
      } else {
        titleEl.style.display = 'none';
      }
    }

    container.textContent = '';
    container.classList.remove('picked');

    rewardCards.forEach((cardId, idx) => {
      _renderRewardCardOption(container, cardId, data, deps, () => this.takeRewardCard(cardId, deps), idx);
    });

    // --- 축복(Blessing) 보상 추가 ---
    // 지역 보스는 확정, 중간 보스는 30% 확률, 그 외 전투는 미출현
    const shouldOfferBlessing = isBoss || (isMiniBoss && Math.random() < 0.3);
    if (shouldOfferBlessing) {
      const maxEnergyCap = _getMaxEnergyCap(gs);
      const isEnergyCapReached = (gs.player.maxEnergy || 0) >= maxEnergyCap;
      const blessingHp = { id: 'blessing_hp', name: '영구적인 활력', icon: '❤️', desc: '최대 체력이 영구적으로 20 증가합니다.', type: 'hp', amount: 20 };
      const blessingEnergy = {
        id: 'blessing_energy',
        name: '영구적인 기운',
        icon: '⚡',
        desc: '최대 에너지가 영구적으로 1 증가합니다.',
        type: 'energy',
        amount: 1,
        disabled: isEnergyCapReached,
        disabledReason: `이미 최대 에너지입니다. (최대 ${maxEnergyCap})`,
      };

      _renderBlessingOption(container, blessingHp, deps, () => this.takeRewardBlessing(blessingHp, deps), rewardCards.length);
      _renderBlessingOption(container, blessingEnergy, deps, () => this.takeRewardBlessing(blessingEnergy, deps), rewardCards.length + 1);
    }

    const relicChance = isElite ? RELIC_REWARD_CHANCE_ELITE : RELIC_REWARD_CHANCE_NORMAL;
    const shouldOfferItem = isBoss || isMiniBoss || Math.random() < relicChance;
    if (shouldOfferItem) {
      const availableItems = _getRewardItemPool(gs, data, 'reward');
      const targetRarity = isBoss ? ['boss', 'legendary', 'rare'] : (isMiniBoss ? ['rare', 'legendary'] : ['common', 'uncommon']);
      const pool = availableItems.filter((item) => targetRarity.includes(item.rarity));
      const itemPool = pool.length > 0
        ? pool
        : availableItems;
      if (itemPool.length > 0) {
        const classIds = Object.keys(data?.classes || {});
        const extraChoices = ClassProgressionSystem.getRewardRelicChoiceBonus(gs, { classIds });
        const totalChoices = 1 + Math.max(0, extraChoices);
        const pickedItems = _drawUniqueItems(itemPool, totalChoices);
        const itemBaseIndex = rewardCards.length + (shouldOfferBlessing ? 2 : 0);
        pickedItems.forEach((item, offset) => {
          _renderItemOption(
            container,
            item,
            deps,
            () => this.takeRewardItem(item.id, deps),
            itemBaseIndex + offset,
          );
        });
      }
    }

    deps.switchScreen?.('reward');
  },

  takeRewardBlessing(blessing, deps = {}) {
    const gs = _getGS(deps);
    if (!gs) return;

    return runIdempotent(REWARD_CLAIM_KEY, () => {
      if (gs._rewardLock) return;
      if (blessing.type === 'energy') {
        const maxEnergyCap = _getMaxEnergyCap(gs);
        if ((gs.player.maxEnergy || 0) >= maxEnergyCap) {
          deps.audioEngine?.playHit?.();
          deps.showItemToast?.({
            name: blessing.name,
            icon: blessing.icon || '⚡',
            desc: `이미 최대 에너지입니다. (최대 ${maxEnergyCap})`,
          });
          return;
        }
      }

      gs._rewardLock = true;

      const doc = _getDoc(deps);
      doc.getElementById('rewardCards')?.classList.add('picked');

      if (blessing.type === 'hp') {
        gs.dispatch('player:max_hp_growth', { amount: blessing.amount });
      } else if (blessing.type === 'energy') {
        gs.dispatch('player:max_energy_growth', { amount: blessing.amount });
      }

      deps.playItemGet?.();
      deps.showItemToast?.({ name: blessing.name, icon: blessing.icon, desc: blessing.desc });
      setTimeout(() => deps.returnToGame?.(true), 350);
    }, { ttlMs: 3000 });
  },

  takeRewardCard(cardId, deps = {}) {
    const gs = _getGS(deps);
    const data = _getData(deps);
    if (!gs || !data) return;

    return runIdempotent(REWARD_CLAIM_KEY, () => {
      if (gs._rewardLock) return;
      gs._rewardLock = true;

      const doc = _getDoc(deps);
      doc.getElementById('rewardCards')?.classList.add('picked');

      gs.player.deck.unshift(cardId);
      registerCardDiscovered(gs, cardId);

      const card = data.cards?.[cardId];
      deps.playItemGet?.();
      deps.showItemToast?.({ name: card?.name || cardId, icon: card?.icon || '🃏', desc: card?.desc || '' });
      setTimeout(() => deps.returnToGame?.(true), 350);
    }, { ttlMs: 3000 });
  },

  takeRewardItem(itemKey, deps = {}) {
    const gs = _getGS(deps);
    const data = _getData(deps);
    if (!gs || !data) return;

    return runIdempotent(REWARD_CLAIM_KEY, () => {
      if (gs._rewardLock) return;
      gs._rewardLock = true;

      const doc = _getDoc(deps);
      doc.getElementById('rewardCards')?.classList.add('picked');

      gs.player.items.push(itemKey);
      registerItemFound(gs, itemKey);

      const item = data.items?.[itemKey];
      if (item && typeof item.onAcquire === 'function') {
        item.onAcquire(gs);
      }

      deps.playItemGet?.();
      deps.showItemToast?.(item);
      setTimeout(() => deps.returnToGame?.(true), 350);
    }, { ttlMs: 3000 });
  },

  takeRewardUpgrade(deps = {}) {
    const gs = _getGS(deps);
    const data = _getData(deps);
    if (!gs || !data) return;

    return runIdempotent(REWARD_CLAIM_KEY, () => {
      if (gs._rewardLock) return;

      const upgradable = (gs.player.deck || []).filter((id) => data.upgradeMap?.[id]);
      if (!upgradable.length) {
        deps.audioEngine?.playHit?.();
        return;
      }

      gs._rewardLock = true;
      const cardId = upgradable[Math.floor(Math.random() * upgradable.length)];
      const upgId = data.upgradeMap[cardId];
      const idx = gs.player.deck.indexOf(cardId);
      if (idx >= 0) gs.player.deck[idx] = upgId;
      registerCardDiscovered(gs, upgId);

      deps.playItemGet?.();
      deps.showItemToast?.({ name: `🛠️ 강화 완료: ${data.cards?.[upgId]?.name || upgId}`, icon: '✨', desc: '무작위 카드 1장이 업그레이드되었습니다.' });
      setTimeout(() => deps.returnToGame?.(true), 350);
    }, { ttlMs: 3000 });
  },

  takeRewardRemove(deps = {}) {
    const gs = _getGS(deps);
    if (!gs) return;

    return runIdempotent(REWARD_CLAIM_KEY, () => {
      if (gs._rewardLock) return;
      gs._rewardLock = true;

      const doc = _getDoc(deps);
      doc.getElementById('rewardCards')?.classList.add('picked');

      const eventUI = deps.EventUI;
      if (eventUI && typeof eventUI.showCardDiscard === 'function') {
        eventUI.showCardDiscard(gs, true, {
          ...deps,
          onCancel: () => {
            gs._rewardLock = false;
            clearIdempotencyKey(REWARD_CLAIM_KEY);
            doc.getElementById('rewardCards')?.classList.remove('picked');
          },
          returnToGame: (force) => deps.returnToGame?.(force),
        });
      } else {
        deps.returnToGame?.(true);
      }
    }, { ttlMs: 3000 });
  },

  showSkipConfirm(deps = {}) {
    const doc = _getDoc(deps);
    const initBtn = doc.getElementById('rewardSkipInitBtn');
    const confirmRow = doc.getElementById('skipConfirmRow');
    if (initBtn) initBtn.style.display = 'none';
    if (confirmRow) confirmRow.style.display = 'flex';
  },

  hideSkipConfirm(deps = {}) {
    const doc = _getDoc(deps);
    const initBtn = doc.getElementById('rewardSkipInitBtn');
    const confirmRow = doc.getElementById('skipConfirmRow');
    if (initBtn) initBtn.style.display = '';
    if (confirmRow) confirmRow.style.display = 'none';
  },

  skipReward(deps = {}) {
    const gs = _getGS(deps);
    if (!gs) return;

    return runIdempotent(REWARD_SKIP_KEY, () => {
      if (gs._rewardLock) return;
      gs._rewardLock = true;
      deps.returnToGame?.(true);
    }, { ttlMs: 3000 });
  },
};
