/**
 * event_ui.js — 이벤트/상점/휴식 UI (순수 View)
 *
 * EventManager에서 이벤트 데이터/로직 결과를 받아 DOM만 업데이트합니다.
 */
import { DescriptionUtils } from '../../utils/description_utils.js';
import { AudioEngine } from '../../../engine/audio.js';
import { GS } from '../../core/game_state.js';
import { DATA } from '../../../data/game_data.js';
import { SecurityUtils } from '../../utils/security.js';
import { EventManager } from '../../systems/event_manager.js';


let _currentEvent = null;

function _getDoc(deps) {
  return deps?.doc || document;
}

function _getGS(deps) {
  return deps?.gs;
}

function _getData(deps) {
  return deps?.data;
}

function _getRunRules(deps) {
  return deps?.runRules;
}

function _renderChoices(event, doc, deps = {}) {
  const choicesEl = doc.getElementById('eventChoices');
  if (!choicesEl) return;
  choicesEl.textContent = '';
  event.choices.forEach((choice, idx) => {
    const btn = doc.createElement('div');
    btn.className = 'event-choice';
    btn.textContent = choice.text;
    btn.addEventListener('click', () => EventUI.resolveEvent(idx, deps));
    choicesEl.appendChild(btn);
  });
}

export const EventUI = {
  triggerRandomEvent(deps = {}) {
    const gs = _getGS(deps);
    const data = _getData(deps);

    // ── 로직 위임 ──
    const picked = EventManager.pickRandomEvent(gs, data);
    if (picked) this.showEvent(picked, deps);
  },

  updateEventGoldBar(deps = {}) {
    const gs = _getGS(deps);
    if (!gs?.player) return;
    const doc = _getDoc(deps);
    const player = gs.player;
    const gEl = doc.getElementById('eventGoldDisplay');
    const hEl = doc.getElementById('eventHpDisplay');
    const dEl = doc.getElementById('eventDeckDisplay');
    if (gEl) gEl.textContent = player.gold ?? 0;
    if (hEl) hEl.textContent = `${Math.max(0, player.hp ?? 0)}/${player.maxHp ?? 0}`;
    if (dEl) {
      const totalCards = (player.deck?.length || 0) + (player.hand?.length || 0) + (player.graveyard?.length || 0);
      dEl.textContent = totalCards;
    }
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
    const imgContEl = doc.getElementById('eventImageContainer');

    if (eyebrowEl) eyebrowEl.textContent = event.eyebrow || 'LAYER 1 · 이벤트';
    if (titleEl) titleEl.textContent = event.title;
    if (descEl) descEl.textContent = event.desc;

    if (imgContEl) {
      imgContEl.style.display = 'none';
    }

    this.updateEventGoldBar(deps);

    const deckInfoEl = doc.getElementById('eventDeckDisplay');
    if (deckInfoEl && gs.player) {
      const player = gs.player;
      const totalCards = (player.deck?.length || 0) + (player.hand?.length || 0) + (player.graveyard?.length || 0);
      deckInfoEl.textContent = totalCards;
    }

    _renderChoices(event, doc, deps);
    doc.getElementById('eventModal')?.classList.add('active');
  },

  resolveEvent(choiceIdx, deps = {}) {
    const gs = _getGS(deps);
    if (!gs) return;
    const event = _currentEvent;
    if (!event) return;
    if (!event.persistent && gs._eventLock) return;

    const doc = _getDoc(deps);
    gs._eventLock = true;

    // ── 로직 위임 ──
    const { resultText, isFail, shouldClose, isItemShop } = EventManager.resolveEventChoice(gs, event, choiceIdx);

    if (typeof deps.updateUI === 'function') deps.updateUI();
    this.updateEventGoldBar(deps);

    // 아이템 상점으로 전환
    if (isItemShop) return;

    // 결과 없음 → 모달 닫기
    if (!resultText && !isItemShop) {
      console.log('[resolveEvent] no result, closing event');
      doc.getElementById('eventModal')?.classList.remove('active');
      _currentEvent = null;
      gs._eventLock = false;
      if (typeof deps.switchScreen === 'function') deps.switchScreen('game');
      if (typeof deps.updateUI === 'function') deps.updateUI();
      if (typeof deps.renderMinimap === 'function') deps.renderMinimap();
      if (typeof deps.updateNextNodes === 'function') deps.updateNextNodes();
      return;
    }

    // 결과 텍스트 표시
    const descEl = doc.getElementById('eventDesc');
    if (descEl) descEl.textContent = resultText;

    // 실패 or 지속 이벤트 → 선택지 다시 표시
    if (event.persistent || isFail) {
      _renderChoices(event, doc, deps);
      this.updateEventGoldBar(deps);
      gs._eventLock = false;
      return;
    }

    // 성공 → "계속" 버튼
    const choicesEl = doc.getElementById('eventChoices');
    if (choicesEl) {
      choicesEl.textContent = '';
      const continueBtn = doc.createElement('div');
      continueBtn.className = 'event-choice';
      continueBtn.id = 'eventChoiceContinue';
      continueBtn.textContent = '계속';
      continueBtn.addEventListener('click', () => {
        console.log('[event continue] clicked');
        doc.getElementById('eventModal')?.classList.remove('active');
        _currentEvent = null;
        gs._eventLock = false;
        if (typeof deps.switchScreen === 'function') deps.switchScreen('game');
        if (typeof deps.updateUI === 'function') deps.updateUI();
        if (typeof deps.renderMinimap === 'function') deps.renderMinimap();
        if (typeof deps.updateNextNodes === 'function') deps.updateNextNodes();
      }, { once: true });
      choicesEl.appendChild(continueBtn);
    }
  },

  showShop(deps = {}) {
    const gs = _getGS(deps);
    const data = _getData(deps);
    const runRules = _getRunRules(deps);
    if (!gs || !data || !runRules) return;

    const self = this;

    // ── 로직 위임: 이벤트 객체 생성 ──
    const shop = EventManager.createShopEvent(gs, data, runRules, {
      showItemShopFn: (state) => self.showItemShop(state, deps),
    });
    if (!shop) return;

    // UI에서 필요한 사운드 콜백 추가
    shop.choices.forEach(choice => {
      const originalEffect = choice.effect;
      choice.effect = (state) => {
        const result = originalEffect(state);
        if (result && !result.includes('부족') && !result.includes('없다') && result !== '__item_shop_open__') {
          if (typeof deps.playItemGet === 'function') deps.playItemGet();
          if (typeof deps.updateUI === 'function') deps.updateUI();
        }
        return result;
      };
    });

    self.showEvent(shop, deps);
  },

  showRestSite(deps = {}) {
    const gs = _getGS(deps);
    const data = _getData(deps);
    const runRules = _getRunRules(deps);
    if (!gs || !data || !runRules) return;

    const self = this;

    // ── 로직 위임 ──
    const rest = EventManager.createRestEvent(gs, data, runRules, {
      showCardDiscardFn: (state, isBurn) => self.showCardDiscard(state, isBurn, deps),
    });
    if (!rest) return;

    self.showEvent(rest, deps);
  },

  showCardDiscard(gsArg, isBurn = false, deps = {}) {
    const gs = gsArg || _getGS(deps);
    const data = _getData(deps);
    if (!gs?.player || !data?.cards) return;

    const allCards = [
      ...(gs.player.deck || []),
      ...(gs.player.hand || []),
      ...(gs.player.graveyard || []),
    ];

    if (allCards.length === 0) {
      if (deps.audioEngine) deps.audioEngine.playHit();
      else if (typeof AudioEngine !== 'undefined') AudioEngine.playHit();
      if (deps.screenShake) deps.screenShake.shake(10, 0.4);
      else if (typeof ScreenShake !== 'undefined') ScreenShake.shake(10, 0.4);
      gs.addLog('⚠️ 소각/처분할 카드가 덱에 없습니다.', 'damage');
      if (typeof deps.returnToGame === 'function') {
        setTimeout(() => deps.returnToGame(true), 500);
      }
      return;
    }

    const doc = _getDoc(deps);
    const overlay = doc.createElement('div');
    overlay.id = 'cardDiscardOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(3,3,10,0.94);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:40px 24px;gap:20px;z-index:800;backdrop-filter:blur(12px);overflow-y:auto;animation:fadeIn 0.3s ease both;';

    const titleEl = doc.createElement('div');
    titleEl.style.textAlign = 'center';

    const eyebrow = doc.createElement('div');
    eyebrow.style.cssText = "font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.4em;color:var(--text-dim);margin-bottom:8px;";
    eyebrow.textContent = isBurn ? '🔥 소각' : '🗑️ 처분';

    const bigTitle = doc.createElement('div');
    bigTitle.style.cssText = "font-family:'Cinzel Decorative',serif;font-size:22px;font-weight:900;color:var(--white);margin-bottom:6px;";
    bigTitle.textContent = isBurn ? '🔥 소각할 카드를 선택하세요' : '🗑️ 버릴 카드를 선택하세요 (+8골드)';

    const subTitle = doc.createElement('div');
    subTitle.style.cssText = "font-family:'Crimson Pro',serif;font-style:italic;font-size:13px;color:var(--text-dim);";
    subTitle.textContent = isBurn ? '선택한 카드가 덱에서 영구 제거됩니다.' : '선택한 카드를 팔고 8골드를 받습니다.';

    titleEl.append(eyebrow, bigTitle, subTitle);

    const list = doc.createElement('div');
    list.id = 'discardCardList';
    list.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:700px;';

    const cancelBtn = doc.createElement('button');
    cancelBtn.style.cssText = "font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.2em;color:var(--text-dim);background:none;border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:10px 24px;cursor:pointer;margin-top:8px;";
    cancelBtn.textContent = '취소';
    cancelBtn.onclick = () => overlay.remove();

    overlay.append(titleEl, list, cancelBtn);
    doc.body.appendChild(overlay);

    const discardList = doc.getElementById('discardCardList');
    if (!discardList) return;
    const uniqueCards = [...new Set(allCards)];
    const rarityColor = { common: 'var(--text-dim)', uncommon: 'var(--echo-bright)', rare: 'var(--gold)', legendary: '#c084fc' };

    uniqueCards.forEach(cardId => {
      const card = data.cards[cardId];
      if (!card) return;
      const count = allCards.filter(id => id === cardId).length;

      const btn = doc.createElement('div');
      btn.style.cssText = `cursor:pointer;background:rgba(10,5,30,0.9);border:1px solid ${rarityColor[card.rarity] || 'var(--border)'};border-radius:10px;padding:12px;width:120px;text-align:center;transition:all 0.2s;position:relative;`;

      const icon = doc.createElement('div');
      icon.style.cssText = 'font-size:22px;margin-bottom:6px;';
      icon.textContent = card.icon || '🃏';

      const name = doc.createElement('div');
      name.style.cssText = `font-family:'Cinzel',serif;font-size:10px;font-weight:700;color:${rarityColor[card.rarity] || 'var(--white)'};margin-bottom:3px;`;
      name.textContent = card.name;

      const desc = doc.createElement('div');
      desc.style.cssText = 'font-size:10px;color:var(--text-dim);line-height:1.3;';
      desc.textContent = card.desc || '';

      btn.append(icon, name, desc);

      if (count > 1) {
        const countBadge = doc.createElement('div');
        countBadge.style.cssText = 'position:absolute;top:4px;right:6px;font-size:9px;color:var(--echo);';
        countBadge.textContent = `×${count}`;
        btn.appendChild(countBadge);
      }

      btn.onmouseenter = () => {
        btn.style.borderColor = 'var(--cyan)';
        btn.style.boxShadow = '0 0 12px rgba(0,255,204,0.3)';
      };
      btn.onmouseleave = () => {
        btn.style.borderColor = rarityColor[card.rarity] || 'var(--border)';
        btn.style.boxShadow = '';
      };
      btn.onclick = () => {
        // ── 로직 위임 ──
        const result = EventManager.discardCard(gs, cardId, data, isBurn);
        if (result.success) {
          if (typeof deps.playItemGet === 'function') deps.playItemGet();
          if (typeof deps.updateUI === 'function') deps.updateUI();
        }
        overlay.remove();
        if (isBurn && typeof deps.returnToGame === 'function') {
          deps.returnToGame(true);
        }
      };
      discardList.appendChild(btn);
    });
  },

  showItemShop(gsArg, deps = {}) {
    const gs = gsArg || _getGS(deps);
    const data = _getData(deps);
    const runRules = _getRunRules(deps);
    if (!gs?.player || !data?.items || !runRules) return;

    // ── 로직 위임: 상점 아이템 생성 ──
    const shopStock = EventManager.generateItemShopStock(gs, data, runRules);

    const rarityConfig = {
      common: { label: '일반', color: 'var(--text)', border: 'rgba(150,150,180,0.3)' },
      uncommon: { label: '고급', color: 'var(--echo-bright)', border: 'rgba(123,47,255,0.4)' },
      rare: { label: '희귀', color: 'var(--gold)', border: 'rgba(240,180,41,0.5)' },
      legendary: { label: '전설', color: '#c084fc', border: 'rgba(192,132,252,0.6)' },
    };

    const doc = _getDoc(deps);
    const overlay = doc.createElement('div');
    overlay.id = 'itemShopOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(3,3,10,0.94);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;z-index:800;backdrop-filter:blur(12px);animation:fadeIn 0.3s ease both;';

    const titleCont = doc.createElement('div');
    titleCont.style.textAlign = 'center';

    const eyebrow = doc.createElement('div');
    eyebrow.style.cssText = "font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.4em;color:var(--gold);margin-bottom:8px;";
    eyebrow.textContent = '🏪 아이템 상점';

    const bigTitle = doc.createElement('div');
    bigTitle.style.cssText = "font-family:'Cinzel Decorative',serif;font-size:22px;font-weight:900;color:var(--white);margin-bottom:6px;";
    bigTitle.textContent = '무엇을 구하시겠습니까?';

    const goldInfo = doc.createElement('div');
    goldInfo.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--gold);";
    goldInfo.textContent = '보유 골드: ';
    const goldVal = doc.createElement('span');
    goldVal.id = 'itemShopGold';
    goldVal.textContent = gs.player.gold;
    goldInfo.appendChild(goldVal);

    titleCont.append(eyebrow, bigTitle, goldInfo);

    const list = doc.createElement('div');
    list.id = 'itemShopList';
    list.style.cssText = 'display:flex;gap:14px;flex-wrap:wrap;justify-content:center;max-width:700px;';

    const closeBtn = doc.createElement('button');
    closeBtn.style.cssText = "font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.2em;color:var(--text-dim);background:none;border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:10px 24px;cursor:pointer;";
    closeBtn.textContent = '닫기';
    closeBtn.onclick = () => overlay.remove();

    overlay.append(titleCont, list, closeBtn);
    doc.body.appendChild(overlay);

    const shopList = doc.getElementById('itemShopList');
    if (!shopList) return;

    shopStock.forEach(({ item, cost, rarity }) => {
      const rc = rarityConfig[rarity] || rarityConfig.common;
      const canAfford = gs.player.gold >= cost;

      const card = doc.createElement('div');
      card.style.cssText = `width:170px;height:260px;background:rgba(10,5,30,0.95);border:1px solid ${rc.border};border-radius:12px;padding:16px;text-align:center;cursor:${canAfford ? 'pointer' : 'not-allowed'};opacity:${canAfford ? 1 : 0.5};transition:all 0.2s;position:relative;display:flex;flex-direction:column;`;

      const rarityLabel = doc.createElement('div');
      rarityLabel.style.cssText = `position:absolute;top:8px;right:10px;font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.1em;color:${rc.color};`;
      rarityLabel.textContent = rc.label;

      const iconEl = doc.createElement('div');
      iconEl.style.cssText = 'font-size:46px;margin-bottom:8px;margin-top:20px;';
      iconEl.textContent = item.icon;

      const nameEl = doc.createElement('div');
      nameEl.style.cssText = `font-family:'Cinzel',serif;font-size:16px;font-weight:700;color:${rc.color};margin-bottom:6px;`;
      nameEl.textContent = item.name;

      const descEl = doc.createElement('div');
      descEl.style.cssText = 'font-size:13px;color:var(--text-dim);line-height:1.4;margin-bottom:10px;flex:1;';
      if (window.DescriptionUtils) {
        descEl.innerHTML = window.DescriptionUtils.highlight(item.desc);
      } else {
        descEl.textContent = item.desc;
      }

      const costEl = doc.createElement('div');
      costEl.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:15px;color:var(--gold);font-weight:700;margin-top:auto;";
      costEl.textContent = `${cost} 골드`;

      card.append(rarityLabel, iconEl, nameEl, descEl, costEl);

      const alreadyOwned = gs.player.items.includes(item.id);
      if (alreadyOwned) {
        card.style.opacity = '0.35';
        card.style.cursor = 'not-allowed';
        const ownedOverlay = doc.createElement('div');
        ownedOverlay.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;border-radius:12px;background:rgba(3,3,10,0.5);";
        const ownedLabel = doc.createElement('span');
        ownedLabel.style.cssText = "font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.15em;color:var(--text-dim);";
        ownedLabel.textContent = '보유 중';
        ownedOverlay.appendChild(ownedLabel);
        card.appendChild(ownedOverlay);
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
          // ── 로직 위임 ──
          const result = EventManager.purchaseItem(gs, item, cost);
          if (result.success) {
            if (typeof deps.playItemGet === 'function') deps.playItemGet();
            if (typeof deps.showItemToast === 'function') deps.showItemToast(item);
          }

          overlay.remove();
          doc.getElementById('eventModal')?.classList.remove('active');
          _currentEvent = null;
          gs._eventLock = false;
          if (typeof deps.switchScreen === 'function') deps.switchScreen('game');
          if (typeof deps.updateUI === 'function') deps.updateUI();
          if (typeof deps.renderMinimap === 'function') deps.renderMinimap();
          if (typeof deps.updateNextNodes === 'function') deps.updateNextNodes();
        };
      }
      shopList.appendChild(card);
    });
  },

  // Expose public API for GAME.API
  api: {
    showEvent: (event, deps) => EventUI.showEvent(event, deps),
    resolveEvent: (choiceIdx, deps) => EventUI.resolveEvent(choiceIdx, deps),
    showShop: (deps) => EventUI.showShop(deps),
    showRestSite: (deps) => EventUI.showRestSite(deps),
    showItemShop: (gs, deps) => EventUI.showItemShop(gs, deps),
  }
};
