import { clearIdempotencyKey, clearIdempotencyPrefix, runIdempotent } from '../../utils/idempotency_utils.js';

function _getDoc(deps) {
  return deps?.doc || document;
}

function _getGS(deps) {
  return deps?.gs;
}

function _getData(deps) {
  return deps?.data;
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
  switch (rarity) {
    case 'uncommon': return '비범';
    case 'rare': return '희귀';
    case 'legendary': return '전설';
    case 'common':
    default:
      return '일반';
  }
}

function _toTypeClass(type) {
  if (!type) return '';
  const t = String(type).toLowerCase();
  if (t === 'attack') return 'type-attack';
  if (t === 'skill') return 'type-skill';
  if (t === 'power') return 'type-power';
  return '';
}

function _toTypeLabelClass(type) {
  if (!type) return '';
  const t = String(type).toLowerCase();
  if (t === 'attack') return 'card-type-attack';
  if (t === 'skill') return 'card-type-skill';
  if (t === 'power') return 'card-type-power';
  return '';
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
  gs.addLog?.(`🔥 미니보스 보상: 골드 +${goldGain}, HP +${gs.player.hp - hpBefore}`, 'system');

  const rareItems = Object.values(data.items || {}).filter((item) => {
    return (item.rarity === 'rare' || item.rarity === 'legendary') && !gs.player.items.includes(item.id);
  });
  if (rareItems.length > 0) {
    const guaranteed = rareItems[Math.floor(Math.random() * rareItems.length)];
    gs.player.items.push(guaranteed.id);
    gs.meta?.codex?.items?.add?.(guaranteed.id);
    deps.showItemToast?.(guaranteed);
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
  const typeLabelClass = _toTypeLabelClass(card.type);
  rarity.className = `card-type reward-card-type ${typeLabelClass}`.trim();
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
  rarity.className = 'card-type reward-card-type';
  rarity.textContent = `아이템 · ${_toRarityLabel(item.rarity)}`;

  cardEl.append(icon, name, desc, rarity);
  wrapper.appendChild(cardEl);
  wrapper.addEventListener('click', () => {
    _markRewardSelection(container, wrapper);
    onPick?.();
  });
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
        : (isMiniBoss ? '✦ 미니보스 처치 — 보상 선택 ✦' : (isElite ? '✦ 정예 처치 — 보상 선택 ✦' : '✦ 전투 승리 — 보상 선택 ✦'));
    }

    if (titleEl) {
      if (isBoss) {
        titleEl.textContent = '👑 보스 처치!';
        titleEl.style.display = 'block';
        titleEl.style.color = 'var(--gold)';
      } else if (isMiniBoss) {
        titleEl.textContent = '🔥 미니보스 처치!';
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

    const shouldOfferItem = isBoss || isMiniBoss || Math.random() < 0.3;
    if (shouldOfferItem) {
      const targetRarity = isBoss || isMiniBoss ? ['rare', 'legendary'] : ['common', 'uncommon'];
      const pool = Object.values(data.items || {}).filter((item) => {
        return targetRarity.includes(item.rarity) && !gs.player.items.includes(item.id);
      });
      const itemPool = pool.length > 0
        ? pool
        : Object.values(data.items || {}).filter((item) => !gs.player.items.includes(item.id));
      if (itemPool.length > 0) {
        const item = itemPool[Math.floor(Math.random() * itemPool.length)];
        _renderItemOption(container, item, deps, () => this.takeRewardItem(item.id, deps), rewardCards.length);
      }
    }

    deps.switchScreen?.('reward');
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
      gs.meta?.codex?.cards?.add?.(cardId);

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
      gs.meta?.codex?.items?.add?.(itemKey);

      const item = data.items?.[itemKey];
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
      gs.meta?.codex?.cards?.add?.(upgId);

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
