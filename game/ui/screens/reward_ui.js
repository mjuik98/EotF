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

function _getAudioEngine(deps) {
  return deps?.audioEngine || globalThis.AudioEngine;
}

const REWARD_CLAIM_KEY = 'reward:claim';
const REWARD_SKIP_KEY = 'reward:skip';

export const RewardUI = {
  showRewardScreen(isBoss, deps = {}) {
    const gs = _getGS(deps);
    const data = _getData(deps);
    if (!gs || !data) return;

    if (gs.combat?.active) {
      gs.combat.active = false;
    }

    gs._rewardLock = false;
    clearIdempotencyPrefix('reward:');
    this.hideSkipConfirm(deps);

    const doc = _getDoc(deps);
    const currentNode = gs.currentNode;
    const isElite = currentNode?.type === 'elite';
    const eyebrow = doc.getElementById('rewardEyebrow');
    const titleEl = doc.getElementById('rewardTitle');
    if (eyebrow) eyebrow.textContent = isBoss ? '✦ 보스 처치 — 보상 선택 ✦' : isElite ? '✦ 정예 처치 — 보상 선택 ✦' : '✦ 전투 승리 — 보상 선택 ✦';
    if (titleEl) {
      if (isBoss) {
        titleEl.textContent = '보스 처치!';
        titleEl.style.display = 'block';
        titleEl.style.color = 'var(--gold)';
      } else if (isElite) {
        titleEl.textContent = '⭐ 정예 처치!';
        titleEl.style.display = 'block';
        titleEl.style.color = '#d4a017';
      } else {
        titleEl.style.display = 'none';
      }
    }

    const count = isBoss ? 4 : 3;
    const rarities = isBoss ? ['uncommon', 'uncommon', 'rare', 'rare']
      : isElite ? ['uncommon', 'uncommon', 'rare']
        : ['common', 'uncommon', 'common'];

    const rewardCards = [];
    const usedIds = new Set();
    for (let i = 0; i < count; i++) {
      let cardId = gs.getRandomCard(rarities[i]);
      // 중복 방지 (최대 10회 시도하여 무한 루프 방지)
      let attempts = 0;
      while (usedIds.has(cardId) && attempts < 10) {
        cardId = gs.getRandomCard(rarities[i]);
        attempts++;
      }
      rewardCards.push(cardId);
      usedIds.add(cardId);
    }

    const container = doc.getElementById('rewardCards');
    if (!container) return;
    container.textContent = '';
    container.classList.remove('picked');

    const isNormalCombat = !isBoss && !isElite;
    const specialRoll = isNormalCombat && Math.random() < 0.1;
    let specialType = null;
    if (specialRoll) {
      specialType = ['relic', 'upgrade', 'remove'][Math.floor(Math.random() * 3)];
    }

    rewardCards.forEach((cardId, idx) => {
      const wrapper = doc.createElement('div');
      wrapper.className = 'reward-card-wrapper';
      wrapper.style.animationDelay = `${idx * 0.08}s`;

      if (specialRoll && idx === rewardCards.length - 1) {
        if (specialType === 'relic') {
          const pool = Object.values(data.items).filter(item => !gs.player.items.includes(item.id));
          const item = pool[Math.floor(Math.random() * pool.length)] || data.items.void_shard;

          const cardEl = doc.createElement('div');
          cardEl.className = 'card';
          cardEl.style.cssText = 'width:170px;height:260px;padding-top:20px;padding-bottom:12px;border-color:var(--gold);';

          const icon = doc.createElement('div');
          icon.className = 'card-icon';
          icon.style.fontSize = '46px';
          icon.textContent = '🎁';

          const name = doc.createElement('div');
          name.className = 'card-name';
          name.style.cssText = 'font-size:16px;color:var(--gold);';
          name.textContent = '미지의 유물';

          const desc = doc.createElement('div');
          desc.className = 'card-desc';
          desc.style.cssText = 'font-size:13px;flex:1;';
          desc.textContent = '';
          const line1 = doc.createElement('div');
          line1.textContent = '어떤 유물인지 알 수 없습니다.';
          const line2 = doc.createElement('div');
          line2.textContent = '획득하여 정체를 밝히십시오.';
          desc.append(line1, line2); // Safe here as it's static

          const typeLabel = doc.createElement('div');
          typeLabel.className = 'card-type';
          typeLabel.style.cssText = 'font-size:11px;color:var(--gold);margin-top:auto;';
          typeLabel.textContent = '특수 보상 · 미식별';

          cardEl.append(icon, name, desc, typeLabel);
          wrapper.appendChild(cardEl);
          wrapper.addEventListener('click', () => this.takeRewardItem(item.id, deps));
        } else if (specialType === 'upgrade') {
          const upgradable = gs.player.deck.filter(id => data.upgradeMap[id]);
          const hasUpgradable = upgradable.length > 0;
          const titleStr = hasUpgradable ? '무작위 강화' : '강화 불가';
          const descStr = hasUpgradable ? '덱의 무작위 카드 1장을 즉시 강화합니다.' : '강화 가능한 카드가 덱에 존재하지 않습니다.';

          wrapper.classList.toggle('disabled', !hasUpgradable);
          wrapper.style.opacity = hasUpgradable ? '1' : '0.4';
          wrapper.style.filter = hasUpgradable ? 'none' : 'grayscale(1)';

          const cardEl = doc.createElement('div');
          cardEl.className = 'card';
          cardEl.style.cssText = 'width:170px;height:260px;padding-top:20px;padding-bottom:12px;border-color:var(--echo-bright);';

          const icon = doc.createElement('div');
          icon.className = 'card-icon';
          icon.style.fontSize = '46px';
          icon.textContent = '⚒️';

          const name = doc.createElement('div');
          name.className = 'card-name';
          name.style.cssText = 'font-size:16px;color:var(--echo-bright);';
          name.textContent = titleStr;

          const desc = doc.createElement('div');
          desc.className = 'card-desc';
          desc.style.cssText = 'font-size:13px;flex:1;';
          desc.textContent = descStr;

          const typeLabel = doc.createElement('div');
          typeLabel.className = 'card-type';
          typeLabel.style.cssText = 'font-size:11px;color:var(--echo-bright);margin-top:auto;';
          typeLabel.textContent = '특수 보상';

          cardEl.append(icon, name, desc, typeLabel);
          wrapper.appendChild(cardEl);
          if (hasUpgradable) {
            wrapper.addEventListener('click', () => this.takeRewardUpgrade(deps));
          }
        } else {
          const hasCards = gs.player.deck.length > 0;
          wrapper.classList.toggle('disabled', !hasCards);
          wrapper.style.opacity = hasCards ? '1' : '0.4';
          wrapper.style.filter = hasCards ? 'none' : 'grayscale(1)';

          const cardEl = doc.createElement('div');
          cardEl.className = 'card';
          cardEl.style.cssText = 'width:170px;height:260px;padding-top:20px;padding-bottom:12px;border-color:#ff3366;';

          const icon = doc.createElement('div');
          icon.className = 'card-icon';
          icon.style.fontSize = '46px';
          icon.textContent = '🔥';

          const name = doc.createElement('div');
          name.className = 'card-name';
          name.style.cssText = 'font-size:16px;color:#ff3366;';
          name.textContent = '스킬 소각';

          const desc = doc.createElement('div');
          desc.className = 'card-desc';
          desc.style.cssText = 'font-size:13px;flex:1;';
          desc.textContent = '덱에서 원하는 카드 1장을 영구히 제거합니다.';

          const typeLabel = doc.createElement('div');
          typeLabel.className = 'card-type';
          typeLabel.style.cssText = 'font-size:11px;color:#ff3366;margin-top:auto;';
          typeLabel.textContent = '특수 보상';

          cardEl.append(icon, name, desc, typeLabel);
          if (!hasCards) {
            const noCardsOverlay = doc.createElement('div');
            noCardsOverlay.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);border-radius:8px;font-size:10px;color:var(--text-dim);text-align:center;padding:10px;';
            noCardsOverlay.textContent = '덱에 카드가 없습니다';
            cardEl.appendChild(noCardsOverlay);
          }

          wrapper.appendChild(cardEl);
          if (hasCards) {
            wrapper.addEventListener('mouseenter', (e) => deps.showTooltip?.(e, 'remove_card'));
            wrapper.addEventListener('mouseleave', () => deps.hideTooltip?.());
            wrapper.addEventListener('click', () => {
              deps.hideTooltip?.();
              this.takeRewardRemove(deps);
            });
          }
        }
      } else {
        const card = data.cards[cardId];
        if (!card) return;

        const cardEl = doc.createElement('div');
        cardEl.className = 'card';
        const rarityBorder = card.rarity === 'rare' ? 'rgba(240,180,41,0.4)' : card.rarity === 'uncommon' ? 'rgba(123,47,255,0.4)' : '';
        cardEl.style.cssText = `width:170px;height:260px;padding-bottom:12px;${rarityBorder ? `border-color:${rarityBorder};` : ''}`;

        const cost = doc.createElement('div');
        cost.className = 'card-cost';
        cost.style.cssText = 'width:32px;height:32px;font-size:15px;right:10px;top:10px;';
        cost.textContent = card.cost;

        const icon = doc.createElement('div');
        icon.className = 'card-icon';
        icon.style.cssText = 'font-size:44px;margin-top:18px;';
        icon.textContent = card.icon;

        const name = doc.createElement('div');
        name.className = 'card-name';
        name.style.fontSize = '16px';
        name.textContent = card.name;

        const desc = doc.createElement('div');
        desc.className = 'card-desc';
        desc.style.cssText = 'font-size:13px;flex:1;';
        if (deps.DescriptionUtils) {
          desc.innerHTML = deps.DescriptionUtils.highlight(card.desc);
        } else {
          desc.textContent = card.desc;
        }

        const typeLabel = doc.createElement('div');
        typeLabel.className = 'card-type';
        typeLabel.style.cssText = `font-size:11px;color:${rarityBorder || 'var(--echo)'};margin-top:auto;`;
        typeLabel.textContent = card.rarity || 'common';

        cardEl.append(cost, icon, name, desc, typeLabel);
        wrapper.appendChild(cardEl);
        wrapper.addEventListener('mouseenter', (e) => deps.showTooltip?.(e, cardId));
        wrapper.addEventListener('mouseleave', () => deps.hideTooltip?.());
        wrapper.addEventListener('click', () => {
          deps.hideTooltip?.();
          this.takeRewardCard(cardId, deps);
        });
      }
      container.appendChild(wrapper);
    });

    const shouldOfferItem = isBoss || Math.random() < 0.3;
    if (shouldOfferItem) {
      const targetRarity = isBoss ? ['rare', 'legendary'] : ['common', 'uncommon'];
      const pool = Object.values(data.items)
        .filter(item => targetRarity.includes(item.rarity) && !gs.player.items.includes(item.id));
      const itemPool = pool.length > 0 ? pool : Object.values(data.items).filter(item => !gs.player.items.includes(item.id));
      if (itemPool.length > 0) {
        const item = itemPool[Math.floor(Math.random() * itemPool.length)];
        const rc = item.rarity || 'common';
        const rarityColor = { common: 'var(--text-dim)', uncommon: 'var(--echo-bright)', rare: 'var(--gold)', legendary: '#c084fc' };
        const rarityBorderItem = { common: 'rgba(150,150,180,0.3)', uncommon: 'rgba(123,47,255,0.4)', rare: 'rgba(240,180,41,0.5)', legendary: 'rgba(192,132,252,0.6)' };

        const wrapper = doc.createElement('div');
        wrapper.className = 'reward-card-wrapper';
        wrapper.style.animationDelay = `${rewardCards.length * 0.08}s`;

        const cardEl = doc.createElement('div');
        cardEl.className = 'card';
        cardEl.style.cssText = `width:170px;height:260px;padding-bottom:12px;border-color:${rarityBorderItem[rc]};`;

        const icon = doc.createElement('div');
        icon.className = 'card-icon';
        icon.style.cssText = 'font-size:46px;margin-top:20px;';
        icon.textContent = '❓';

        const name = doc.createElement('div');
        name.className = 'card-name';
        name.style.cssText = `font-size:16px;color:${rarityColor[rc]};`;
        name.textContent = '미지의 보물';

        const desc = doc.createElement('div');
        desc.className = 'card-desc';
        desc.style.cssText = 'font-size:13px;flex:1;';
        desc.textContent = '';
        const l1 = doc.createElement('div');
        l1.textContent = '신비로운 기운이 흐르는 유물입니다.';
        const l2 = doc.createElement('div');
        l2.textContent = '무엇인지는 획득 후에 알 수 있습니다.';
        desc.append(l1, l2);

        const typeLabel = doc.createElement('div');
        typeLabel.className = 'card-type';
        typeLabel.style.cssText = `font-size:11px;color:${rarityColor[rc]};margin-top:auto;`;
        typeLabel.textContent = '아이템 · 미식별';

        cardEl.append(icon, name, desc, typeLabel);
        wrapper.appendChild(cardEl);
        wrapper.addEventListener('click', () => this.takeRewardItem(item.id, deps));
        container.appendChild(wrapper);
      }
    }

    if (typeof deps.switchScreen === 'function') {
      deps.switchScreen('reward');
    }
  },

  takeRewardCard(cardId, deps = {}) {
    const gs = _getGS(deps);
    const data = _getData(deps);
    if (!gs || !data) return;
    return runIdempotent(REWARD_CLAIM_KEY, () => {
      if (gs._rewardLock) return;
      gs._rewardLock = true;

      const doc = _getDoc(deps);
      const container = doc.getElementById('rewardCards');
      if (container) {
        const wrappers = container.querySelectorAll('.reward-card-wrapper');
        wrappers.forEach(() => {
          // Keep current behavior: mark container as picked.
        });
        container.classList.add('picked');
      }

      gs.player.deck.unshift(cardId);
      if (gs.meta.codex) gs.meta.codex.cards.add(cardId);
      const card = data.cards[cardId];
      if (typeof deps.playItemGet === 'function') deps.playItemGet();
      if (typeof deps.showItemToast === 'function') {
        deps.showItemToast({ name: card?.name, icon: card?.icon, desc: card?.desc });
      }
      if (typeof deps.returnToGame === 'function') {
        setTimeout(() => deps.returnToGame(true), 350);
      }
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
      const container = doc.getElementById('rewardCards');
      if (container) {
        container.classList.add('picked');
      }

      gs.player.items.push(itemKey);
      if (gs.meta.codex) gs.meta.codex.items.add(itemKey);
      const item = data.items[itemKey];
      if (typeof deps.playItemGet === 'function') deps.playItemGet();
      if (typeof deps.showItemToast === 'function') deps.showItemToast(item);
      if (typeof deps.returnToGame === 'function') {
        setTimeout(() => deps.returnToGame(true), 350);
      }
    }, { ttlMs: 3000 });
  },

  takeRewardUpgrade(deps = {}) {
    const gs = _getGS(deps);
    const data = _getData(deps);
    if (!gs || !data) return;
    return runIdempotent(REWARD_CLAIM_KEY, () => {
      if (gs._rewardLock) return;

    const upgradable = gs.player.deck.filter(id => data.upgradeMap[id]);
    if (upgradable.length > 0) {
      gs._rewardLock = true;
      const cardId = upgradable[Math.floor(Math.random() * upgradable.length)];
      const upgId = data.upgradeMap[cardId];
      const idx = gs.player.deck.indexOf(cardId);
      if (idx >= 0) gs.player.deck[idx] = upgId; // Index-based replacement is already FIFO-neutral, fine.
      if (gs.meta.codex) gs.meta.codex.cards.add(upgId);
      if (typeof deps.playItemGet === 'function') deps.playItemGet();
      if (typeof deps.showItemToast === 'function') {
        const upgCard = data.cards[upgId];
        deps.showItemToast({ name: `${upgCard?.name} 강화 완료`, icon: '⚒️', desc: '무작위 카드가 업그레이드되었습니다.' });
      }
      if (typeof deps.returnToGame === 'function') {
        setTimeout(() => deps.returnToGame(true), 350);
      }
    } else {
      // 강화 대상이 없을 때 경고음 및 취소 방지
      _getAudioEngine(deps)?.playHit?.();
      return;
    }
    }, { ttlMs: 3000 });
  },

  takeRewardRemove(deps = {}) {
    const gs = _getGS(deps);
    if (!gs) return;
    return runIdempotent(REWARD_CLAIM_KEY, () => {
      if (gs._rewardLock) return;

      gs._rewardLock = true;
    const doc = _getDoc(deps);
    const container = doc.getElementById('rewardCards');
    if (container) container.classList.add('picked');

    // 소각은 오버레이에서 선택 후 returnToGame 호출하므로 락을 걸지 않거나 오버레이 안에서 관리
    // 의존성 주입된 eventUI 사용
    const eventUI = deps.EventUI;
    if (eventUI && typeof eventUI.showCardDiscard === 'function') {
      eventUI.showCardDiscard(gs, true, {
        ...deps,
        onCancel: () => {
          gs._rewardLock = false;
          clearIdempotencyKey(REWARD_CLAIM_KEY);
          container?.classList.remove('picked');
        },
        returnToGame: (force) => {
          if (typeof deps.returnToGame === 'function') deps.returnToGame(force);
        }
      });
    } else {
      if (typeof deps.returnToGame === 'function') deps.returnToGame(true);
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
      if (typeof deps.returnToGame === 'function') deps.returnToGame(true);
    }, { ttlMs: 3000 });
  },
};
