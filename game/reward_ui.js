'use strict';

import { AudioEngine } from '../engine/audio.js';
import { DescriptionUtils } from './description_utils.js';
import { DATA } from '../data/game_data.js';
import { EventUI } from './event_ui.js';
import { GS } from './game_state.js';



  function _getDoc(deps) {
    return deps?.doc || document;
  }

  function _getGS(deps) {
    return deps?.gs || GS;
  }

  function _getData(deps) {
    return deps?.data || DATA;
  }

  export const RewardUI = {
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
      container.classList.remove('picked');

      const isNormalCombat = !isBoss && !isElite;
      const specialRoll = isNormalCombat && Math.random() < 0.1;
      let specialType = null;
      if (specialRoll) {
        specialType = ['relic', 'upgrade', 'remove'][Math.floor(Math.random() * 3)];
      }

      container.innerHTML = rewardCards.map((cardId, idx) => {
        if (specialRoll && idx === rewardCards.length - 1) {
          // 마지막 슬롯을 특별 보상으로 대체
          if (specialType === 'relic') {
            const pool = Object.values(data.items).filter(item => !gs.player.items.includes(item.id));
            const item = pool[Math.floor(Math.random() * pool.length)] || data.items.void_shard;
            return `<div class="reward-card-wrapper" onclick="takeRewardItem('${item.id}')" style="animation-delay:${idx * 0.08}s;">
              <div class="card" style="width:170px;height:260px;padding-top:20px;padding-bottom:12px;border-color:var(--gold);">
                <div class="card-icon" style="font-size:46px;">🎁</div>
                <div class="card-name" style="font-size:16px;color:var(--gold);">미지의 유물</div>
                <div class="card-desc" style="font-size:13px;flex:1;">어떤 유물인지 알 수 없습니다.<br>획득하여 정체를 밝히십시오.</div>
                <div class="card-type" style="font-size:11px;color:var(--gold);margin-top:auto;">특수 보상 · 미식별</div>
              </div>
            </div>`;
          } else if (specialType === 'upgrade') {
            const upgradable = gs.player.deck.filter(id => data.upgradeMap[id]);
            const hasUpgradable = upgradable.length > 0;
            const title = hasUpgradable ? '무작위 강화' : '강화 불가';
            const desc = hasUpgradable ? '덱의 무작위 카드 1장을 즉시 강화합니다.' : '강화 가능한 카드가 덱에 존재하지 않습니다.';
            const opacity = hasUpgradable ? 1 : 0.4;
            const filter = hasUpgradable ? 'none' : 'grayscale(1)';

            return `<div class="reward-card-wrapper ${hasUpgradable ? '' : 'disabled'}" onclick="takeRewardUpgrade()" style="animation-delay:${idx * 0.08}s; opacity:${opacity}; filter:${filter};">
              <div class="card" style="width:170px;height:260px;padding-top:20px;padding-bottom:12px;border-color:var(--echo-bright);">
                <div class="card-icon" style="font-size:46px;">⚒️</div>
                <div class="card-name" style="font-size:16px;color:var(--echo-bright);">${title}</div>
                <div class="card-desc" style="font-size:13px;flex:1;">${desc}</div>
                <div class="card-type" style="font-size:11px;color:var(--echo-bright);margin-top:auto;">특수 보상</div>
              </div>
            </div>`;
          } else {
            return `<div class="reward-card-wrapper" onclick="takeRewardRemove()" style="animation-delay:${idx * 0.08}s;">
              <div class="card" style="width:170px;height:260px;padding-top:20px;padding-bottom:12px;border-color:#ff3366;">
                <div class="card-icon" style="font-size:46px;">🔥</div>
                <div class="card-name" style="font-size:16px;color:#ff3366;">스킬 소각</div>
                <div class="card-desc" style="font-size:13px;flex:1;">덱에서 원하는 카드 1장을 영구히 제거합니다.</div>
                <div class="card-type" style="font-size:11px;color:#ff3366);margin-top:auto;">특수 보상</div>
              </div>
            </div>`;
          }
        }

        const card = data.cards[cardId];
        if (!card) return '';
        const rarityBorder = card.rarity === 'rare' ? 'rgba(240,180,41,0.4)' : card.rarity === 'uncommon' ? 'rgba(123,47,255,0.4)' : '';
        return `<div class="reward-card-wrapper" onclick="takeRewardCard('${cardId}')"
          onmouseenter="showTooltip(event,'${cardId}')" onmouseleave="hideTooltip()"
          style="animation-delay:${idx * 0.08}s;">
          <div class="card" style="width:170px;height:260px;padding-bottom:12px;${rarityBorder ? `border-color:${rarityBorder};` : ''}">
            <div class="card-cost" style="width:32px;height:32px;font-size:15px;right:10px;top:10px;">${card.cost}</div>
            <div class="card-icon" style="font-size:44px;margin-top:18px;">${card.icon}</div>
            <div class="card-name" style="font-size:16px;">${card.name}</div>
            <div class="card-desc" style="font-size:13px;flex:1;">${DescriptionUtils ? DescriptionUtils.highlight(card.desc) : card.desc}</div>
            <div class="card-type" style="font-size:11px;color:${rarityBorder || 'var(--echo)'};margin-top:auto;">${card.rarity || 'common'}</div>
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
            <div class="card" style="width:170px;height:260px;padding-bottom:12px;border-color:${rarityBorderItem[rc]};">
              <div class="card-icon" style="font-size:46px;margin-top:20px;">❓</div>
              <div class="card-name" style="font-size:16px;color:${rarityColor[rc]};">미지의 보물</div>
              <div class="card-desc" style="font-size:13px;flex:1;">신비로운 기운이 흐르는 유물입니다.<br>무엇인지는 획득 후에 알 수 있습니다.</div>
              <div class="card-type" style="font-size:11px;color:${rarityColor[rc]};margin-top:auto;">아이템 · 미식별</div>
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

    takeRewardUpgrade(deps = {}) {
      const gs = _getGS(deps);
      const data = _getData(deps);
      if (!gs || !data) return;
      if (gs._rewardLock) return;

      const upgradable = gs.player.deck.filter(id => data.upgradeMap[id]);
      if (upgradable.length > 0) {
        gs._rewardLock = true;
        const cardId = upgradable[Math.floor(Math.random() * upgradable.length)];
        const upgId = data.upgradeMap[cardId];
        const idx = gs.player.deck.indexOf(cardId);
        if (idx >= 0) gs.player.deck[idx] = upgId;
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
        if (typeof AudioEngine !== 'undefined' && AudioEngine.playHit) AudioEngine.playHit();
        return;
      }
    },

    takeRewardRemove(deps = {}) {
      const gs = _getGS(deps);
      if (!gs) return;
      if (gs._rewardLock) return;
      // 소각은 오버레이에서 선택 후 returnToGame 호출하므로 락을 걸지 않거나 오버레이 안에서 관리
      if (EventUI && typeof EventUI.showCardDiscard === 'function') {
        EventUI.showCardDiscard(gs, true, {
          ...deps, returnToGame: (force) => {
            if (typeof deps.returnToGame === 'function') deps.returnToGame(force);
          }
        });
      } else {
        if (typeof deps.returnToGame === 'function') deps.returnToGame(true);
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
