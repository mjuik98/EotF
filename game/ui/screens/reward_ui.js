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

function _ensureMiniBossBonus(gs, data, deps) {
  const heal = Math.max(1, Math.floor((gs.player.maxHp || 1) * 0.15));
  const hpBefore = gs.player.hp || 0;
  gs.player.hp = Math.min(gs.player.maxHp || 1, hpBefore + heal);

  const goldGain = Math.max(12, Math.floor((gs.currentRegion + 1) * 6));
  gs.player.gold = (gs.player.gold || 0) + goldGain;
  gs.addLog?.(`Mini boss reward: +${goldGain} gold, +${gs.player.hp - hpBefore} HP`, 'system');

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
  wrapper.style.cursor = 'pointer';

  const cardEl = doc.createElement('div');
  cardEl.className = 'card';
  cardEl.style.cssText = 'width:170px;height:260px;padding:14px;display:flex;flex-direction:column;gap:8px;';

  const cost = doc.createElement('div');
  cost.className = 'card-cost';
  cost.textContent = String(card.cost ?? 1);

  const icon = doc.createElement('div');
  icon.className = 'card-icon';
  icon.style.fontSize = '36px';
  icon.textContent = card.icon || '*';

  const name = doc.createElement('div');
  name.className = 'card-name';
  name.textContent = card.name || cardId;

  const desc = doc.createElement('div');
  desc.className = 'card-desc';
  desc.style.cssText = 'font-size:12px;line-height:1.4;';
  if (deps.DescriptionUtils) {
    desc.innerHTML = deps.DescriptionUtils.highlight(card.desc || '');
  } else {
    desc.textContent = card.desc || '';
  }

  const rarity = doc.createElement('div');
  rarity.className = 'card-type';
  rarity.textContent = card.rarity || 'common';

  cardEl.append(cost, icon, name, desc, rarity);
  wrapper.appendChild(cardEl);
  wrapper.addEventListener('click', onPick);
  container.appendChild(wrapper);
}

function _renderItemOption(container, item, deps, onPick, idx) {
  const doc = _getDoc(deps);
  if (!item) return;

  const wrapper = doc.createElement('button');
  wrapper.type = 'button';
  wrapper.className = 'reward-card-wrapper';
  wrapper.style.animationDelay = `${idx * 0.08}s`;
  wrapper.style.cursor = 'pointer';

  const cardEl = doc.createElement('div');
  cardEl.className = 'card';
  cardEl.style.cssText = 'width:170px;height:260px;padding:14px;display:flex;flex-direction:column;gap:8px;border-color:var(--gold);';

  const icon = doc.createElement('div');
  icon.className = 'card-icon';
  icon.style.fontSize = '40px';
  icon.textContent = item.icon || 'I';

  const name = doc.createElement('div');
  name.className = 'card-name';
  name.textContent = item.name || item.id;

  const desc = doc.createElement('div');
  desc.className = 'card-desc';
  desc.style.cssText = 'font-size:12px;line-height:1.4;';
  if (deps.DescriptionUtils) {
    desc.innerHTML = deps.DescriptionUtils.highlight(item.desc || '');
  } else {
    desc.textContent = item.desc || '';
  }

  const rarity = doc.createElement('div');
  rarity.className = 'card-type';
  rarity.textContent = `item · ${item.rarity || 'common'}`;

  cardEl.append(icon, name, desc, rarity);
  wrapper.appendChild(cardEl);
  wrapper.addEventListener('click', onPick);
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
        ? 'Boss Reward'
        : (isMiniBoss ? 'Mini Boss Reward' : (isElite ? 'Elite Reward' : 'Combat Reward'));
    }

    if (titleEl) {
      if (isBoss) {
        titleEl.textContent = 'BOSS DEFEATED';
        titleEl.style.display = 'block';
        titleEl.style.color = 'var(--gold)';
      } else if (isMiniBoss) {
        titleEl.textContent = 'MINI BOSS DOWN';
        titleEl.style.display = 'block';
        titleEl.style.color = '#ff7a33';
      } else if (isElite) {
        titleEl.textContent = 'ELITE DEFEATED';
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
      deps.showItemToast?.({ name: card?.name || cardId, icon: card?.icon || '*', desc: card?.desc || '' });
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
      deps.showItemToast?.({ name: `Upgraded: ${data.cards?.[upgId]?.name || upgId}`, icon: '+', desc: 'A random card was upgraded.' });
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
