import { EventManager } from '../../systems/event_manager.js';
import { clearIdempotencyPrefix, runIdempotent } from '../../utils/idempotency_utils.js';
import { RARITY_LABELS } from '../../../data/rarity_meta.js';
import {
  EVENT_DISCARD_CARD_RARITY_COLORS,
  ITEM_SHOP_RARITY_BORDER_COLORS,
  ITEM_SHOP_RARITY_TEXT_COLORS,
} from '../../../data/ui_rarity_styles.js';
import {
  dismissEventModal,
  dismissTransientOverlay,
  getAudioEngine,
  getData,
  getDoc,
  getEventId,
  getGS,
  getRunRules,
  getShopItemIcon,
} from './event_ui_helpers.js';
import { renderChoices, updateEventGoldBar } from './event_ui_dom.js';
import { startRestFillParticles } from './event_ui_particles.js';

let _currentEvent = null;

function requestFrame(cb) {
  if (typeof globalThis.requestAnimationFrame === 'function') {
    return globalThis.requestAnimationFrame(cb);
  }
  return setTimeout(() => cb(Date.now()), 16);
}

function finishEventFlow(doc, gs, deps) {
  dismissEventModal(doc.getElementById('eventModal'), () => {
    _currentEvent = null;
    gs._eventLock = false;
    if (typeof deps.switchScreen === 'function') deps.switchScreen('game');
    if (typeof deps.updateUI === 'function') deps.updateUI();
    if (typeof deps.renderMinimap === 'function') deps.renderMinimap();
    if (typeof deps.updateNextNodes === 'function') deps.updateNextNodes();
  });
}

export const EventUI = {
  triggerRandomEvent(deps = {}) {
    const gs = getGS(deps);
    const data = getData(deps);
    const picked = EventManager.pickRandomEvent(gs, data);
    if (picked) this.showEvent(picked, deps);
  },

  updateEventGoldBar(deps = {}) {
    const gs = getGS(deps);
    if (!gs?.player) return;
    updateEventGoldBar(getDoc(deps), gs.player);
  },

  showEvent(event, deps = {}) {
    const gs = getGS(deps);
    if (!event || !gs) return;

    const doc = getDoc(deps);
    _currentEvent = event;
    gs._eventLock = false;
    clearIdempotencyPrefix('event:resolve:');

    const eyebrowEl = doc.getElementById('eventEyebrow');
    const titleEl = doc.getElementById('eventTitle');
    const descEl = doc.getElementById('eventDesc');
    const imgContEl = doc.getElementById('eventImageContainer');

    if (eyebrowEl) eyebrowEl.textContent = event.eyebrow || 'LAYER 1 EVENT';
    if (titleEl) titleEl.textContent = event.title;
    if (descEl) descEl.textContent = event.desc;
    if (imgContEl) imgContEl.style.display = 'none';

    this.updateEventGoldBar(deps);
    renderChoices(event, doc, gs, (choiceIdx) => EventUI.resolveEvent(choiceIdx, deps));
    doc.getElementById('eventModal')?.classList?.add('active');
  },

  resolveEvent(choiceIdx, deps = {}) {
    const gs = getGS(deps);
    if (!gs) return;
    const event = _currentEvent;
    if (!event) return;
    if (!event.persistent && gs._eventLock) return;

    const guardKey = `event:resolve:${getEventId(event)}:${choiceIdx}`;
    return runIdempotent(guardKey, () => {
      const doc = getDoc(deps);
      gs._eventLock = true;

      let resolution = null;
      try {
        resolution = EventManager.resolveEventChoice(gs, event, choiceIdx);
      } catch (err) {
        console.error('[resolveEvent] choice effect error:', err);
        gs._eventLock = false;
        getAudioEngine(deps)?.playHit?.();
        return;
      }

      const selectedChoice = event?.choices?.[choiceIdx];
      const { resultText, isFail, shouldClose, isItemShop, acquiredCard, acquiredItem } = resolution || {};
      const sharedData = globalThis.DATA || {};

      if (typeof deps.updateUI === 'function') deps.updateUI();
      this.updateEventGoldBar(deps);

      if (acquiredCard && typeof deps.showItemToast === 'function') {
        const cardData = sharedData.cards?.[acquiredCard];
        if (cardData) {
          deps.showItemToast(cardData, {
            typeLabel: `${RARITY_LABELS[cardData.rarity] || cardData.rarity} card acquired`,
          });
        }
      }

      if (acquiredItem && typeof deps.showItemToast === 'function') {
        const itemData = sharedData.items?.[acquiredItem];
        if (itemData) deps.showItemToast(itemData);
      }

      if (isItemShop) {
        gs._eventLock = false;
        return;
      }

      if (!resultText) {
        finishEventFlow(doc, gs, deps);
        return;
      }

      const descEl = doc.getElementById('eventDesc');
      if (descEl) descEl.textContent = resultText;

      const choiceText = String(selectedChoice?.text || '');
      const choiceClass = String(selectedChoice?.cssClass || '');
      const isUpgradeChoice = choiceClass.includes('shop-choice-upgrade')
        || /\uCE74\uB4DC\s*\uAC15\uD654|\uAC15\uD654/.test(choiceText);

      if (!isFail && isUpgradeChoice && typeof deps.showItemToast === 'function') {
        const upgradedName = String(resultText || '').match(/(?:\u2728\s*)?(.+?)\s+\uAC15\uD654\s*\uC644\uB8CC/i)?.[1]?.trim()
          || 'Upgraded Card';
        deps.showItemToast({
          name: `Upgrade: ${upgradedName}`,
          icon: '\u2728',
          desc: resultText,
        });
      }

      if (event.persistent || isFail) {
        renderChoices(event, doc, gs, (nextChoiceIdx) => EventUI.resolveEvent(nextChoiceIdx, deps));
        this.updateEventGoldBar(deps);
        gs._eventLock = false;
        return;
      }

      if (!shouldClose) {
        gs._eventLock = false;
        return;
      }

      const choicesEl = doc.getElementById('eventChoices');
      if (!choicesEl) return;

      choicesEl.textContent = '';
      const continueBtn = doc.createElement('div');
      continueBtn.className = 'event-choice';
      continueBtn.id = 'eventChoiceContinue';
      continueBtn.textContent = '\uACC4\uC18D';
      continueBtn.addEventListener('click', () => finishEventFlow(doc, gs, deps), { once: true });
      choicesEl.appendChild(continueBtn);
    }, { ttlMs: 800 });
  },

  showShop(deps = {}) {
    const gs = getGS(deps);
    const data = getData(deps);
    const runRules = getRunRules(deps);
    if (!gs || !data || !runRules) return;

    const shop = EventManager.createShopEvent(gs, data, runRules, {
      showItemShopFn: (state) => this.showItemShop(state, deps),
    });
    if (!shop) return;

    shop.choices.forEach((choice) => {
      const originalEffect = choice.effect;
      if (typeof originalEffect !== 'function') return;
      choice.effect = (state) => {
        const result = originalEffect(state);
        const resultText = (typeof result === 'object' && result !== null) ? result.resultText : result;
        const isSkip = typeof resultText === 'string'
          && (resultText.includes('not enough') || resultText.includes('cannot'));
        if (result && !isSkip && result !== '__item_shop_open__') {
          if (typeof deps.playItemGet === 'function') deps.playItemGet();
          if (typeof deps.updateUI === 'function') deps.updateUI();
        }
        return result;
      };
    });

    this.showEvent(shop, deps);
  },

  showRestSite(deps = {}) {
    const gs = getGS(deps);
    const data = getData(deps);
    const runRules = getRunRules(deps);
    if (!gs || !data || !runRules) return;

    const doc = getDoc(deps);
    const audioEngine = getAudioEngine(deps);
    const baseHeal = Math.floor(gs.player.maxHp * 0.25);
    const healAmount = runRules.getHealAmount(gs, baseHeal);
    const echoGain = 30;
    const oldHp = gs.player.hp;
    const oldEcho = gs.player.echo || 0;

    gs.heal(healAmount);
    gs.addEcho(echoGain);

    const newHp = gs.player.hp;
    const newEcho = gs.player.echo || 0;
    const overlay = doc.createElement('div');
    overlay.className = 'rest-fill-overlay';
    overlay.innerHTML = `
      <div class="rest-fill-bg"></div>
      <canvas id="restFillParticleCanvas" class="rest-fill-particle-canvas"></canvas>
      <div class="rest-fill-content">
        <div class="rest-fill-icon">*</div>
        <div class="rest-fill-title">Restoration</div>
        <div class="rest-fill-subtitle">Energy settles and the wound closes.</div>
        <div class="rest-fill-bars">
          <div class="rest-fill-stat">
            <span class="rest-fill-label">HP</span>
            <div class="rest-fill-bar-track">
              <div class="rest-fill-bar hp-fill" id="restHpFill" style="width: ${(oldHp / gs.player.maxHp) * 100}%"></div>
            </div>
            <span class="rest-fill-value" id="restHpValue">${oldHp}/${gs.player.maxHp}</span>
          </div>
          <div class="rest-fill-stat">
            <span class="rest-fill-label">Echo</span>
            <div class="rest-fill-bar-track">
              <div class="rest-fill-bar echo-fill" id="restEchoFill" style="width: ${Math.min(oldEcho, 100)}%"></div>
            </div>
            <span class="rest-fill-value" id="restEchoValue">${oldEcho}/100</span>
          </div>
        </div>
      </div>
    `;
    doc.body.appendChild(overlay);
    const restParticleFx = startRestFillParticles(overlay, doc);

    requestFrame(() => {
      overlay.classList.add('active');
    });

    const totalSeqDuration = 3200;
    const healStartDelay = 600;
    const healDuration = 1400;
    const startTime = globalThis.performance?.now?.() || Date.now();

    const updateSequence = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / totalSeqDuration, 1);
      let currentBoost = 0.1;

      if (elapsed < healStartDelay) {
        const p = elapsed / healStartDelay;
        currentBoost = 0.1 + p * 0.06;
      } else if (elapsed < healStartDelay + healDuration) {
        const p = (elapsed - healStartDelay) / healDuration;
        const eased = 1 - Math.pow(1 - p, 2);
        currentBoost = 0.16 + eased * 0.84;
      } else {
        const p = Math.min(
          1,
          (elapsed - (healStartDelay + healDuration)) / (totalSeqDuration - (healStartDelay + healDuration))
        );
        const eased = Math.pow(p, 0.5);
        currentBoost = 1.0 - eased * 0.92;
      }
      restParticleFx.setBoost(currentBoost);

      if (elapsed >= healStartDelay && elapsed <= healStartDelay + healDuration) {
        const p = (elapsed - healStartDelay) / healDuration;
        const eased = 1 - Math.pow(1 - p, 3);
        const hpBar = doc.getElementById('restHpFill');
        const echoBar = doc.getElementById('restEchoFill');
        const hpVal = doc.getElementById('restHpValue');
        const echoVal = doc.getElementById('restEchoValue');
        const currentHp = Math.round(oldHp + (newHp - oldHp) * eased);
        const currentEcho = Math.round(oldEcho + (newEcho - oldEcho) * eased);

        if (hpBar) hpBar.style.width = `${(currentHp / gs.player.maxHp) * 100}%`;
        if (echoBar) echoBar.style.width = `${Math.min(currentEcho, 100)}%`;
        if (hpVal) hpVal.textContent = `${currentHp}/${gs.player.maxHp}`;
        if (echoVal) echoVal.textContent = `${currentEcho}/100`;

        if (!updateSequence._playedSound) {
          audioEngine?.playHeal?.();
          updateSequence._playedSound = true;
        }
      }

      if (progress < 1) {
        requestFrame(updateSequence);
        return;
      }

      overlay.classList.remove('active');
      overlay.classList.add('fade-out');

      setTimeout(() => {
        restParticleFx.stop();
        overlay.remove();

        const rest = EventManager.createRestEvent(gs, data, runRules, {
          showCardDiscardFn: (state, isBurn) => this.showCardDiscard(state, isBurn, deps),
        });
        if (!rest) return;

        rest.desc = `Recovered ${newHp - oldHp} HP and gained ${newEcho - oldEcho} Echo. Choose your next action.`;
        this.showEvent(rest, deps);
        if (typeof deps.updateUI === 'function') deps.updateUI();
      }, 500);
    };

    requestFrame(updateSequence);
  },

  showCardDiscard(gsArg, isBurn = false, deps = {}) {
    const gs = gsArg || getGS(deps);
    const data = getData(deps);
    if (!gs?.player || !data?.cards) return;

    const allCards = [
      ...(gs.player.deck || []),
      ...(gs.player.hand || []),
      ...(gs.player.graveyard || []),
    ];

    if (allCards.length === 0) {
      getAudioEngine(deps)?.playHit?.();
      if (deps.screenShake) deps.screenShake.shake(10, 0.4);
      else if (globalThis.ScreenShake) globalThis.ScreenShake.shake(10, 0.4);
      gs.addLog('No cards are available for this action.', 'damage');
      return;
    }

    const doc = getDoc(deps);
    const overlay = doc.createElement('div');
    overlay.id = 'cardDiscardOverlay';
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(3,3,10,0.96);
      display:flex;flex-direction:column;align-items:center;justify-content:flex-start;
      padding:40px 24px;gap:20px;z-index:6000;backdrop-filter:blur(20px);
      overflow-y:auto; transition: opacity 0.3s ease;
      animation: modalFadeInDown 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both;
    `;

    const titleEl = doc.createElement('div');
    titleEl.style.textAlign = 'center';

    const eyebrow = doc.createElement('div');
    eyebrow.style.cssText = "font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.4em;color:var(--text-dim);margin-bottom:8px;";
    eyebrow.textContent = isBurn ? 'BURN' : 'DISCARD';

    const bigTitle = doc.createElement('div');
    bigTitle.style.cssText = "font-family:'Cinzel Decorative',serif;font-size:22px;font-weight:900;color:var(--white);margin-bottom:6px;";
    bigTitle.textContent = isBurn ? 'Choose a card to burn' : 'Choose a card to discard (+8 gold)';

    const subTitle = doc.createElement('div');
    subTitle.style.cssText = "font-family:'Crimson Pro',serif;font-style:italic;font-size:13px;color:var(--text-dim);";
    subTitle.textContent = isBurn
      ? 'The selected card is removed permanently.'
      : 'Discard the selected card and gain 8 gold.';

    titleEl.append(eyebrow, bigTitle, subTitle);

    const list = doc.createElement('div');
    list.id = 'discardCardList';
    list.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:700px;';

    const cancelBtn = doc.createElement('button');
    cancelBtn.style.cssText = "font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.2em;color:var(--text-dim);background:none;border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:10px 24px;cursor:pointer;margin-top:8px;";
    cancelBtn.textContent = '\uCDE8\uC18C';
    cancelBtn.onclick = () => {
      deps.onCancel?.();
      dismissTransientOverlay(overlay);
    };

    overlay.append(titleEl, list, cancelBtn);
    doc.body.appendChild(overlay);

    const discardList = doc.getElementById('discardCardList');
    if (!discardList) return;

    const uniqueCards = [...new Set(allCards)];
    const rarityColor = EVENT_DISCARD_CARD_RARITY_COLORS;

    uniqueCards.forEach((cardId) => {
      const card = data.cards[cardId];
      if (!card) return;
      const count = allCards.filter((id) => id === cardId).length;

      const btn = doc.createElement('div');
      btn.style.cssText = `cursor:pointer;background:rgba(10,5,30,0.9);border:1px solid ${rarityColor[card.rarity] || 'var(--border)'};border-radius:10px;padding:12px;width:120px;text-align:center;transition:all 0.2s;position:relative;`;

      const icon = doc.createElement('div');
      icon.style.cssText = 'font-size:22px;margin-bottom:6px;';
      icon.textContent = card.icon || '*';

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
        countBadge.textContent = `x${count}`;
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
        const result = EventManager.discardCard(gs, cardId, data, isBurn);
        if (result.success) {
          if (typeof deps.playItemGet === 'function') deps.playItemGet();
          if (typeof deps.updateUI === 'function') deps.updateUI();
        }
        dismissTransientOverlay(overlay);
      };
      discardList.appendChild(btn);
    });
  },

  showItemShop(gsArg, deps = {}) {
    const gs = gsArg || getGS(deps);
    const data = getData(deps);
    const runRules = getRunRules(deps);
    if (!gs?.player || !data?.items || !runRules) return;

    const shopStock = EventManager.generateItemShopStock(gs, data, runRules);
    const rarityConfig = {
      common: { label: RARITY_LABELS.common, color: ITEM_SHOP_RARITY_TEXT_COLORS.common, border: ITEM_SHOP_RARITY_BORDER_COLORS.common },
      uncommon: { label: RARITY_LABELS.uncommon, color: ITEM_SHOP_RARITY_TEXT_COLORS.uncommon, border: ITEM_SHOP_RARITY_BORDER_COLORS.uncommon },
      rare: { label: RARITY_LABELS.rare, color: ITEM_SHOP_RARITY_TEXT_COLORS.rare, border: ITEM_SHOP_RARITY_BORDER_COLORS.rare },
      legendary: { label: RARITY_LABELS.legendary, color: ITEM_SHOP_RARITY_TEXT_COLORS.legendary, border: ITEM_SHOP_RARITY_BORDER_COLORS.legendary },
    };

    const doc = getDoc(deps);
    const overlay = doc.createElement('div');
    overlay.id = 'itemShopOverlay';
    overlay.className = 'item-shop-overlay';

    const titleCont = doc.createElement('div');
    titleCont.className = 'item-shop-title';

    const eyebrow = doc.createElement('div');
    eyebrow.className = 'item-shop-eyebrow';
    eyebrow.textContent = 'ITEM SHOP';

    const bigTitle = doc.createElement('div');
    bigTitle.className = 'item-shop-main-title';
    bigTitle.textContent = 'What will you buy?';

    const goldInfo = doc.createElement('div');
    goldInfo.className = 'item-shop-gold';
    goldInfo.textContent = 'Gold: ';
    const goldVal = doc.createElement('span');
    goldVal.id = 'itemShopGold';
    goldVal.textContent = gs.player.gold;
    goldInfo.appendChild(goldVal);

    titleCont.append(eyebrow, bigTitle, goldInfo);

    const list = doc.createElement('div');
    list.id = 'itemShopList';
    list.className = 'item-shop-list';

    const closeBtn = doc.createElement('button');
    closeBtn.className = 'item-shop-close-btn';
    closeBtn.textContent = '\uB2EB\uAE30';
    closeBtn.onclick = () => {
      dismissTransientOverlay(overlay);
    };

    overlay.append(titleCont, list, closeBtn);
    doc.body.appendChild(overlay);

    const shopList = doc.getElementById('itemShopList');
    if (!shopList) return;

    const renderShopList = () => {
      goldVal.textContent = gs.player.gold;
      shopList.textContent = '';

      shopStock.forEach(({ item, cost, rarity }) => {
        const rc = rarityConfig[rarity] || rarityConfig.common;
        const alreadyOwned = (gs.player.items || []).includes(item.id);
        const canAfford = gs.player.gold >= cost;
        const purchasable = !alreadyOwned && canAfford;

        const card = doc.createElement('div');
        card.className = `item-shop-card rarity-${rarity}`;
        card.style.setProperty('--shop-border-color', rc.border);
        card.style.setProperty('--shop-rarity-color', rc.color);
        card.style.opacity = purchasable ? '1' : '0.5';
        card.style.cursor = purchasable ? 'pointer' : 'not-allowed';

        const rarityLabel = doc.createElement('div');
        rarityLabel.className = 'item-shop-rarity';
        rarityLabel.style.color = rc.color;
        rarityLabel.textContent = rc.label;

        const iconEl = doc.createElement('div');
        iconEl.className = 'item-shop-icon';
        iconEl.textContent = getShopItemIcon(item, rarity);

        const nameEl = doc.createElement('div');
        nameEl.className = 'item-shop-name';
        nameEl.style.color = rc.color;
        nameEl.textContent = item.name;

        const descEl = doc.createElement('div');
        descEl.className = 'item-shop-desc';
        if (globalThis.DescriptionUtils) descEl.innerHTML = globalThis.DescriptionUtils.highlight(item.desc);
        else descEl.textContent = item.desc;

        const costEl = doc.createElement('div');
        costEl.className = 'item-shop-cost';
        costEl.textContent = `${cost} \uACE8\uB4DC`;

        card.append(rarityLabel, iconEl, nameEl, descEl, costEl);

        if (alreadyOwned) {
          const ownedOverlay = doc.createElement('div');
          ownedOverlay.className = 'item-shop-owned-overlay';
          const ownedLabel = doc.createElement('span');
          ownedLabel.className = 'item-shop-owned-label';
          ownedLabel.textContent = '\uBCF4\uC720 \uC911';
          ownedOverlay.appendChild(ownedLabel);
          card.appendChild(ownedOverlay);
        } else if (purchasable) {
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
            const result = EventManager.purchaseItem(gs, item, cost);
            if (!result.success) return;

            if (typeof deps.playItemGet === 'function') deps.playItemGet();
            if (typeof deps.showItemToast === 'function') deps.showItemToast(item, { forceQueue: true });
            if (typeof deps.updateUI === 'function') deps.updateUI();
            EventUI.updateEventGoldBar(deps);
            renderShopList();
          };
        }

        shopList.appendChild(card);
      });
    };

    renderShopList();
  },

  api: {
    showEvent: (event, deps) => EventUI.showEvent(event, deps),
    resolveEvent: (choiceIdx, deps) => EventUI.resolveEvent(choiceIdx, deps),
    showShop: (deps) => EventUI.showShop(deps),
    showRestSite: (deps) => EventUI.showRestSite(deps),
    showItemShop: (gs, deps) => EventUI.showItemShop(gs, deps),
  },
};
