'use strict';

(function initEventUI(globalObj) {
  let _currentEvent = null;

  function _getDoc(deps) {
    return deps?.doc || document;
  }

  function _getGS(deps) {
    return deps?.gs || globalObj.GS;
  }

  function _getData(deps) {
    return deps?.data || globalObj.DATA;
  }

  function _getRunRules(deps) {
    return deps?.runRules || globalObj.RunRules;
  }

  function _renderChoices(event, doc) {
    const choicesEl = doc.getElementById('eventChoices');
    if (!choicesEl) return;
    choicesEl.innerHTML = event.choices.map((choice, idx) => `
      <div class="event-choice" onclick="resolveEvent(${idx})">${choice.text}</div>
    `).join('');
  }

  const EventUI = {
    triggerRandomEvent(deps = {}) {
      const gs = _getGS(deps);
      const data = _getData(deps);
      if (!gs || !data?.events) return;
      const pool = data.events.filter(event => {
        if (event.layer === 2 && gs.currentFloor < 2) return false;
        return true;
      });
      if (!pool.length) return;
      const picked = pool[Math.floor(Math.random() * pool.length)];
      this.showEvent(picked, deps);
    },

    updateEventGoldBar(deps = {}) {
      const gs = _getGS(deps);
      if (!gs?.player) return;
      const doc = _getDoc(deps);
      const player = gs.player;
      const gEl = doc.getElementById('eventGoldDisplay');
      const hEl = doc.getElementById('eventHpDisplay');
      const eEl = doc.getElementById('eventEchoDisplay');
      if (gEl) gEl.textContent = player.gold ?? 0;
      if (hEl) hEl.textContent = `${Math.max(0, player.hp ?? 0)}/${player.maxHp ?? 0}`;
      if (eEl) eEl.textContent = Math.floor(player.echo ?? 0);
    },

    showEvent(event, deps = {}) {
      const gs = _getGS(deps);
      if (!event || !gs) return;

      const doc = _getDoc(deps);
      _currentEvent = event;
      gs._eventLock = false;

      const eyebrowEl = doc.getElementById('eventEyebrow');
      const titleEl = doc.getElementById('eventTitle');
      const descEl = doc.getElementById('eventDesc');
      if (eyebrowEl) eyebrowEl.textContent = event.eyebrow || 'LAYER 1 · 이벤트';
      if (titleEl) titleEl.textContent = event.title;
      if (descEl) descEl.textContent = event.desc;
      this.updateEventGoldBar(deps);

      const deckInfoEl = doc.getElementById('eventDeckInfo');
      if (deckInfoEl && gs.player) {
        const player = gs.player;
        const totalCards = (player.deck?.length || 0) + (player.hand?.length || 0) + (player.graveyard?.length || 0);
        const goldStr = player.gold !== undefined ? `<span style="color:var(--gold);">💰 ${player.gold}골드</span>` : '';
        const hpStr = player.hp !== undefined ? `<span style="color:var(--hp-color);">❤️ ${player.hp}/${player.maxHp}</span>` : '';
        const deckStr = `<span style="color:var(--echo);">🃏 덱 ${totalCards}장</span>`;
        deckInfoEl.innerHTML = [hpStr, goldStr, deckStr].filter(Boolean).join('<span style="opacity:0.25;margin:0 4px;">|</span>');
        deckInfoEl.style.display = 'flex';
      }

      _renderChoices(event, doc);
      doc.getElementById('eventModal')?.classList.add('active');
    },

    resolveEvent(choiceIdx, deps = {}) {
      const gs = _getGS(deps);
      if (!gs) return;
      const event = _currentEvent;
      if (!event) return;
      if (!event.persistent && gs._eventLock) return;

      const choice = event.choices?.[choiceIdx];
      if (!choice || typeof choice.effect !== 'function') return;

      const doc = _getDoc(deps);
      gs._eventLock = true;

      const result = choice.effect(gs);
      if (typeof deps.updateUI === 'function') deps.updateUI();
      this.updateEventGoldBar(deps);

      if (!result) {
        doc.getElementById('eventModal')?.classList.remove('active');
        _currentEvent = null;
        gs._eventLock = false;
        return;
      }

      const descEl = doc.getElementById('eventDesc');
      if (descEl) descEl.textContent = result;

      const isFail = result.includes('부족') || result.includes('없다') || result.includes('부족.');
      if (event.persistent || isFail) {
        _renderChoices(event, doc);
        this.updateEventGoldBar(deps);
        gs._eventLock = false;
        return;
      }

      const choicesEl = doc.getElementById('eventChoices');
      if (choicesEl) {
        choicesEl.innerHTML = '<div class="event-choice" id="eventChoiceContinue">계속</div>';
        const continueBtn = doc.getElementById('eventChoiceContinue');
        continueBtn?.addEventListener('click', () => {
          doc.getElementById('eventModal')?.classList.remove('active');
          _currentEvent = null;
          gs._eventLock = false;
        }, { once: true });
      }
    },

    showShop(deps = {}) {
      const gs = _getGS(deps);
      const data = _getData(deps);
      const runRules = _getRunRules(deps);
      if (!gs || !data || !runRules) return;

      const self = this;
      const savedMerchant = (gs.worldMemory.savedMerchant || 0) > 0;
      const costPotion = runRules.getShopCost(gs, savedMerchant ? 8 : 12);
      const costCard = runRules.getShopCost(gs, 15);
      const costUpgrade = runRules.getShopCost(gs, 20);
      const costEnergy = runRules.getShopCost(gs, 30);
      const shop = {
        id: 'shop',
        persistent: true,
        eyebrow: savedMerchant ? 'WORLD MEMORY · 특별 상점' : 'LAYER 1 · 상점',
        title: savedMerchant ? '고마운 상인의 가게' : '잔향 상인',
        desc: savedMerchant
          ? '전에 도움받은 상인이다. 좋은 가격을 제시한다.'
          : '낡은 외투를 입은 상인이 잔향 결정들을 늘어놓고 있다.',
        choices: [
          {
            text: `💊 치료약 (HP +30) — ${costPotion}골드`,
            effect(state) {
              const cost = costPotion;
              if (state.player.gold >= cost) {
                state.player.gold -= cost;
                state.heal(30);
                return `치료약을 마셨다. [남은 골드: ${state.player.gold}]`;
              }
              return `골드 부족! (필요: ${cost}, 보유: ${state.player.gold})`;
            },
          },
          {
            text: `🃏 랜덤 카드 — ${costCard}골드`,
            effect(state) {
              const cost = costCard;
              if (state.player.gold >= cost) {
                state.player.gold -= cost;
                const cardId = state.getRandomCard('uncommon');
                state.player.deck.push(cardId);
                if (state.meta.codex) state.meta.codex.cards.add(cardId);
                if (typeof deps.playItemGet === 'function') deps.playItemGet();
                return `카드 획득: ${data.cards[cardId]?.name} [남은 골드: ${state.player.gold}]`;
              }
              return `골드 부족! (필요: ${cost}, 보유: ${state.player.gold})`;
            },
          },
          {
            text: `⚒️ 카드 강화 — ${costUpgrade}골드`,
            effect(state) {
              const cost = costUpgrade;
              if (state.player.gold < cost) return `골드 부족! (필요: ${cost}, 보유: ${state.player.gold})`;
              const upgradable = state.player.deck.filter(id => data.upgradeMap[id]);
              if (!upgradable.length) return '강화 가능한 카드가 없다.';
              state.player.gold -= cost;
              const cardId = upgradable[Math.floor(Math.random() * upgradable.length)];
              const upgId = data.upgradeMap[cardId];
              const idx = state.player.deck.indexOf(cardId);
              if (idx >= 0) state.player.deck[idx] = upgId;
              if (state.meta.codex) state.meta.codex.cards.add(upgId);
              if (typeof deps.playItemGet === 'function') deps.playItemGet();
              return `${data.cards[cardId]?.name} → ${data.cards[upgId]?.name} [남은 골드: ${state.player.gold}]`;
            },
          },
          {
            text: `⚡ 에너지 강화 — ${costEnergy}골드 (최대 에너지 +1)`,
            effect(state) {
              const cost = costEnergy;
              if (state.player.gold < cost) return `골드 부족! (필요: ${cost}, 보유: ${state.player.gold})`;
              if (state.player.maxEnergy >= 6) return '이미 최대 에너지에 도달했다.';
              state.player.gold -= cost;
              state.player.maxEnergy++;
              state.player.energy = Math.min(state.player.energy + 1, state.player.maxEnergy);
              if (typeof deps.playItemGet === 'function') deps.playItemGet();
              state.addLog(`⚡ 에너지 강화! 최대 에너지 ${state.player.maxEnergy}`, 'echo');
              if (typeof deps.updateUI === 'function') deps.updateUI();
              return `최대 에너지 ${state.player.maxEnergy}으로 증가! [남은 골드: ${state.player.gold}]`;
            },
          },
          {
            text: '💎 아이템 구매 — 골드',
            effect(state) {
              self.showItemShop(state, deps);
              return null;
            },
          },
          {
            text: '🚪 나간다',
            effect() { return null; },
          },
        ],
      };

      self.showEvent(shop, deps);
    },

    showRestSite(deps = {}) {
      const gs = _getGS(deps);
      const data = _getData(deps);
      const runRules = _getRunRules(deps);
      if (!gs || !data || !runRules) return;

      const self = this;
      const rest = {
        id: 'rest',
        eyebrow: 'LAYER 1 · 휴식 장소',
        title: '잔향의 모닥불',
        desc: '꺼지지 않는 이상한 불꽃이 타오르고 있다.',
        choices: [
          {
            text: '❤️ 휴식한다 (HP +25%)',
            effect(state) {
              const baseHeal = Math.floor(state.player.maxHp * 0.25);
              state.heal(runRules.getHealAmount(state, baseHeal));
              return '몸이 회복되었다.';
            },
          },
          {
            text: '🃏 카드를 강화한다 (랜덤 카드 업그레이드)',
            effect(state) {
              const upgradable = state.player.deck.filter(id => data.upgradeMap[id]);
              if (!upgradable.length) return '강화 가능한 카드가 없다.';
              const cardId = upgradable[Math.floor(Math.random() * upgradable.length)];
              const upgId = data.upgradeMap[cardId];
              const idx = state.player.deck.indexOf(cardId);
              if (idx >= 0) {
                state.player.deck[idx] = upgId;
                state.addLog(`✨ ${data.cards[cardId]?.name} → ${data.cards[upgId]?.name} 강화!`, 'echo');
              }
              return `${data.cards[cardId]?.name}이(가) 강화되었다.`;
            },
          },
          {
            text: '⚡ Echo를 충전한다 (Echo +50)',
            effect(state) {
              state.addEcho(50);
              return 'Echo 에너지가 충전됐다.';
            },
          },
          {
            text: '🔥 카드를 소각한다 (덱에서 1장 제거)',
            effect(state) {
              self.showCardDiscard(state, true, deps);
              return null;
            },
          },
        ],
      };

      self.showEvent(rest, deps);
    },

    showCardDiscard(gsArg, isBurn = false, deps = {}) {
      const gs = gsArg || _getGS(deps);
      const data = _getData(deps);
      if (!gs?.player || !data?.cards) return;

      const allCards = [...gs.player.deck];
      if (allCards.length === 0) {
        gs.addLog('덱에 카드가 없다.', 'system');
        return;
      }

      const doc = _getDoc(deps);
      const overlay = doc.createElement('div');
      overlay.id = 'cardDiscardOverlay';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(3,3,10,0.94);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:40px 24px;gap:20px;z-index:800;backdrop-filter:blur(12px);overflow-y:auto;animation:fadeIn 0.3s ease both;';

      const rarityColor = { common: 'var(--text-dim)', uncommon: 'var(--echo-bright)', rare: 'var(--gold)', legendary: '#c084fc' };
      const title = isBurn ? '🔥 소각할 카드를 선택하세요' : '🗑️ 버릴 카드를 선택하세요 (+8골드)';
      const sub = isBurn ? '선택한 카드가 덱에서 영구 제거됩니다.' : '선택한 카드를 팔고 8골드를 받습니다.';

      overlay.innerHTML = `
        <div style="text-align:center;">
          <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.4em;color:var(--text-dim);margin-bottom:8px;">${isBurn ? '🔥 소각' : '🗑️ 처분'}</div>
          <div style="font-family:'Cinzel Decorative',serif;font-size:22px;font-weight:900;color:var(--white);margin-bottom:6px;">${title}</div>
          <div style="font-family:'Crimson Pro',serif;font-style:italic;font-size:13px;color:var(--text-dim);">${sub}</div>
        </div>
        <div id="discardCardList" style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:700px;"></div>
        <button onclick="document.getElementById('cardDiscardOverlay')?.remove()"
          style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.2em;color:var(--text-dim);background:none;border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:10px 24px;cursor:pointer;margin-top:8px;">
          취소
        </button>
      `;
      doc.body.appendChild(overlay);

      const list = doc.getElementById('discardCardList');
      if (!list) return;
      const uniqueCards = [...new Set(allCards)];
      uniqueCards.forEach(cardId => {
        const card = data.cards[cardId];
        if (!card) return;
        const count = allCards.filter(id => id === cardId).length;
        const btn = doc.createElement('div');
        btn.style.cssText = `cursor:pointer;background:rgba(10,5,30,0.9);border:1px solid ${rarityColor[card.rarity] || 'var(--border)'};border-radius:10px;padding:12px;width:120px;text-align:center;transition:all 0.2s;position:relative;`;
        btn.innerHTML = `
          <div style="font-size:22px;margin-bottom:6px;">${card.icon || '🃏'}</div>
          <div style="font-family:'Cinzel',serif;font-size:10px;font-weight:700;color:${rarityColor[card.rarity] || 'var(--white)'};margin-bottom:3px;">${card.name}</div>
          <div style="font-size:10px;color:var(--text-dim);line-height:1.3;">${card.desc || ''}</div>
          ${count > 1 ? `<div style="position:absolute;top:4px;right:6px;font-size:9px;color:var(--echo);">×${count}</div>` : ''}
        `;
        btn.onmouseenter = () => {
          btn.style.borderColor = 'var(--cyan)';
          btn.style.boxShadow = '0 0 12px rgba(0,255,204,0.3)';
        };
        btn.onmouseleave = () => {
          btn.style.borderColor = rarityColor[card.rarity] || 'var(--border)';
          btn.style.boxShadow = '';
        };
        btn.onclick = () => {
          const idx = gs.player.deck.indexOf(cardId);
          if (idx >= 0) {
            gs.player.deck.splice(idx, 1);
            if (!isBurn) {
              gs.addGold(8);
              gs.addLog(`🗑️ ${card.name} 처분 +8골드`, 'system');
            } else {
              gs.addLog(`🔥 ${card.name} 소각`, 'system');
            }
            if (typeof deps.playItemGet === 'function') deps.playItemGet();
            if (typeof deps.updateUI === 'function') deps.updateUI();
          }
          doc.getElementById('cardDiscardOverlay')?.remove();
        };
        list.appendChild(btn);
      });
    },

    showItemShop(gsArg, deps = {}) {
      const gs = gsArg || _getGS(deps);
      const data = _getData(deps);
      const runRules = _getRunRules(deps);
      if (!gs?.player || !data?.items || !runRules) return;

      const rarityConfig = {
        common: { label: '일반', color: 'var(--text)', baseCost: 10, border: 'rgba(150,150,180,0.3)' },
        uncommon: { label: '고급', color: 'var(--echo-bright)', baseCost: 20, border: 'rgba(123,47,255,0.4)' },
        rare: { label: '희귀', color: 'var(--gold)', baseCost: 35, border: 'rgba(240,180,41,0.5)' },
        legendary: { label: '전설', color: '#c084fc', baseCost: 60, border: 'rgba(192,132,252,0.6)' },
      };

      const byRarity = {};
      Object.values(data.items).forEach(item => {
        if (!byRarity[item.rarity]) byRarity[item.rarity] = [];
        byRarity[item.rarity].push(item);
      });

      const shopItems = [];
      ['common', 'uncommon', 'rare', 'legendary'].forEach(rarity => {
        const pool = (byRarity[rarity] || []).filter(item => !gs.player.items.includes(item.id));
        if (pool.length) shopItems.push(pool[Math.floor(Math.random() * pool.length)]);
      });

      const doc = _getDoc(deps);
      const overlay = doc.createElement('div');
      overlay.id = 'itemShopOverlay';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(3,3,10,0.94);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;z-index:800;backdrop-filter:blur(12px);animation:fadeIn 0.3s ease both;';

      overlay.innerHTML = `
        <div style="text-align:center;">
          <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.4em;color:var(--gold);margin-bottom:8px;">🏪 아이템 상점</div>
          <div style="font-family:'Cinzel Decorative',serif;font-size:22px;font-weight:900;color:var(--white);margin-bottom:6px;">무엇을 구하시겠습니까?</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--gold);">보유 골드: <span id="itemShopGold">${gs.player.gold}</span></div>
        </div>
        <div id="itemShopList" style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;max-width:700px;"></div>
        <button onclick="document.getElementById('itemShopOverlay')?.remove()"
          style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.2em;color:var(--text-dim);background:none;border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:10px 24px;cursor:pointer;">
          닫기
        </button>
      `;
      doc.body.appendChild(overlay);

      const list = doc.getElementById('itemShopList');
      if (!list) return;
      shopItems.forEach(item => {
        const rc = rarityConfig[item.rarity] || rarityConfig.common;
        const cost = runRules.getShopCost(gs, rc.baseCost || 10);
        const canAfford = gs.player.gold >= cost;
        const card = doc.createElement('div');
        card.style.cssText = `width:155px;background:rgba(10,5,30,0.95);border:1px solid ${rc.border};border-radius:12px;padding:16px;text-align:center;cursor:${canAfford ? 'pointer' : 'not-allowed'};opacity:${canAfford ? 1 : 0.5};transition:all 0.2s;position:relative;`;
        card.innerHTML = `
          <div style="position:absolute;top:8px;right:10px;font-family:'Cinzel',serif;font-size:8px;letter-spacing:0.1em;color:${rc.color};">${rc.label}</div>
          <div style="font-size:32px;margin-bottom:8px;">${item.icon}</div>
          <div style="font-family:'Cinzel',serif;font-size:11px;font-weight:700;color:${rc.color};margin-bottom:6px;">${item.name}</div>
          <div style="font-size:11px;color:var(--text-dim);line-height:1.4;margin-bottom:10px;">${item.desc}</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:12px;color:var(--gold);font-weight:700;">${cost} 골드</div>
        `;
        const alreadyOwned = gs.player.items.includes(item.id);
        if (alreadyOwned) {
          card.style.opacity = '0.35';
          card.style.cursor = 'not-allowed';
          card.innerHTML += '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;border-radius:12px;background:rgba(3,3,10,0.5);"><span style="font-family:\'Cinzel\',serif;font-size:9px;letter-spacing:0.15em;color:var(--text-dim);">보유 중</span></div>';
        } else if (canAfford) {
          card.onmouseenter = () => {
            card.style.borderColor = 'var(--cyan)';
            card.style.transform = 'translateY(-3px)';
            card.style.boxShadow = '0 8px 24px rgba(0,255,204,0.2)';
          };
          card.onmouseleave = () => {
            card.style.borderColor = rc.border;
            card.style.transform = '';
            card.style.boxShadow = '';
          };
          card.onclick = () => {
            if (gs.player.gold < cost) return;
            gs.player.gold -= cost;
            gs.player.items.push(item.id);
            if (gs.meta.codex) gs.meta.codex.items.add(item.id);
            if (typeof deps.playItemGet === 'function') deps.playItemGet();
            if (typeof deps.showItemToast === 'function') deps.showItemToast(item);
            gs.addLog(`🛍️ ${item.name} 구매!`, 'echo');
            if (typeof deps.updateUI === 'function') deps.updateUI();
            this.updateEventGoldBar(deps);
            doc.getElementById('itemShopOverlay')?.remove();
          };
        }
        list.appendChild(card);
      });
    },
  };

  globalObj.EventUI = EventUI;
})(window);
