'use strict';

(function initRewardUI(globalObj) {
  function _getDoc(deps) {
    return deps?.doc || document;
  }

  function _getGS(deps) {
    return deps?.gs || globalObj.GS;
  }

  function _getData(deps) {
    return deps?.data || globalObj.DATA;
  }

  const RewardUI = {
    showRewardScreen(isBoss, deps = {}) {
      const gs = _getGS(deps);
      const data = _getData(deps);
      if (!gs || !data) return;
      if (gs.combat?.active) return;

      gs._rewardLock = false;
      this.hideSkipConfirm(deps);

      const doc = _getDoc(deps);
      const isElite = gs.currentNode?.type === 'elite';
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
      const rewardCards = Array.from({ length: count }, (_, i) => gs.getRandomCard(rarities[i]));

      const container = doc.getElementById('rewardCards');
      if (!container) return;
      container.classList.remove('picked');
      container.innerHTML = rewardCards.map((cardId, idx) => {
        const card = data.cards[cardId];
        if (!card) return '';
        const rarityBorder = card.rarity === 'rare' ? 'rgba(240,180,41,0.4)' : card.rarity === 'uncommon' ? 'rgba(123,47,255,0.4)' : '';
        return `<div class="reward-card-wrapper" onclick="takeRewardCard('${cardId}')"
          onmouseenter="showTooltip(event,'${cardId}')" onmouseleave="hideTooltip()"
          style="animation-delay:${idx * 0.08}s;">
          <div class="card" style="width:110px;height:auto;min-height:150px;padding-bottom:10px;${rarityBorder ? `border-color:${rarityBorder};` : ''}">
            <div class="card-cost">${card.cost}</div>
            <div class="card-icon" style="font-size:28px;">${card.icon}</div>
            <div class="card-name" style="font-size:11px;">${card.name}</div>
            <div class="card-desc" style="font-size:10px;">${card.desc}</div>
            <div class="card-type" style="font-size:8px;color:${rarityBorder || 'var(--echo)'};">${card.rarity || 'common'}</div>
          </div>
        </div>`;
      }).join('');

      const shouldOfferItem = isBoss || Math.random() < 0.3;
      if (shouldOfferItem) {
        const targetRarity = isBoss ? ['rare', 'legendary'] : ['common', 'uncommon'];
        const pool = Object.values(data.items)
          .filter(item => targetRarity.includes(item.rarity) && !gs.player.items.includes(item.id));
        const itemPool = pool.length > 0 ? pool : Object.values(data.items).filter(item => !gs.player.items.includes(item.id));
        if (itemPool.length > 0) {
          const item = itemPool[Math.floor(Math.random() * itemPool.length)];
          const rarityColor = { common: 'var(--text-dim)', uncommon: 'var(--echo-bright)', rare: 'var(--gold)', legendary: '#c084fc' };
          const rarityBorderItem = { common: 'rgba(150,150,180,0.3)', uncommon: 'rgba(123,47,255,0.4)', rare: 'rgba(240,180,41,0.5)', legendary: 'rgba(192,132,252,0.6)' };
          const rarityLabel = { common: '일반', uncommon: '고급', rare: '희귀', legendary: '전설' };
          const rc = item.rarity || 'common';
          container.innerHTML += `<div class="reward-card-wrapper" onclick="takeRewardItem('${item.id}')" style="animation-delay:${count * 0.08}s;">
            <div class="card" style="width:110px;height:auto;min-height:150px;padding-bottom:10px;border-color:${rarityBorderItem[rc]};">
              <div class="card-icon" style="font-size:30px;">${item.icon}</div>
              <div class="card-name" style="font-size:11px;color:${rarityColor[rc]};">${item.name}</div>
              <div class="card-desc" style="font-size:10px;">${item.desc}</div>
              <div class="card-type" style="font-size:8px;color:${rarityColor[rc]};">아이템 · ${rarityLabel[rc]}</div>
            </div>
          </div>`;
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
      if (gs._rewardLock) return;
      gs._rewardLock = true;

      const doc = _getDoc(deps);
      const container = doc.getElementById('rewardCards');
      if (container) {
        const wrappers = container.querySelectorAll('.reward-card-wrapper');
        wrappers.forEach(wrapper => {
          if (wrapper.getAttribute('onclick')?.includes(cardId)) wrapper.classList.add('selected');
        });
        container.classList.add('picked');
      }

      gs.player.deck.push(cardId);
      if (gs.meta.codex) gs.meta.codex.cards.add(cardId);
      const card = data.cards[cardId];
      if (typeof deps.playItemGet === 'function') deps.playItemGet();
      if (typeof deps.showItemToast === 'function') {
        deps.showItemToast({ name: card?.name, icon: card?.icon, desc: card?.desc });
      }
      if (typeof deps.returnToGame === 'function') {
        setTimeout(() => deps.returnToGame(true), 350);
      }
    },

    takeRewardItem(itemKey, deps = {}) {
      const gs = _getGS(deps);
      const data = _getData(deps);
      if (!gs || !data) return;
      if (gs._rewardLock) return;
      gs._rewardLock = true;

      const doc = _getDoc(deps);
      const container = doc.getElementById('rewardCards');
      if (container) {
        const wrappers = container.querySelectorAll('.reward-card-wrapper');
        wrappers.forEach(wrapper => {
          if (wrapper.getAttribute('onclick')?.includes(itemKey)) wrapper.classList.add('selected');
        });
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
    },

    showSkipConfirm(deps = {}) {
      const doc = _getDoc(deps);
      const initBtn = doc.getElementById('skipInitBtn');
      const confirmRow = doc.getElementById('skipConfirmRow');
      if (initBtn) initBtn.style.display = 'none';
      if (confirmRow) confirmRow.style.display = 'flex';
    },

    hideSkipConfirm(deps = {}) {
      const doc = _getDoc(deps);
      const initBtn = doc.getElementById('skipInitBtn');
      const confirmRow = doc.getElementById('skipConfirmRow');
      if (initBtn) initBtn.style.display = '';
      if (confirmRow) confirmRow.style.display = 'none';
    },

    skipReward(deps = {}) {
      const gs = _getGS(deps);
      if (!gs) return;
      if (gs._rewardLock) return;
      gs._rewardLock = true;
      if (typeof deps.returnToGame === 'function') deps.returnToGame(true);
    },
  };

  globalObj.RewardUI = RewardUI;
})(window);
