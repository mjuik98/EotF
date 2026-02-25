'use strict';

import { DescriptionUtils } from './description_utils.js';
import { CardCostUtils } from './card_cost_utils.js';
import { GS } from './game_state.js';



  function _getDoc(deps) {
    return deps?.doc || document;
  }

  function _getCardTypeClass(type) {
    if (!type) return '';
    const t = type.toLowerCase();
    if (t === 'attack') return 'type-attack';
    if (t === 'skill') return 'type-skill';
    if (t === 'power') return 'type-power';
    return '';
  }

  function _getCardTypeLabelClass(type) {
    if (!type) return '';
    const t = type.toLowerCase();
    if (t === 'attack') return 'card-type-attack';
    if (t === 'skill') return 'card-type-skill';
    if (t === 'power') return 'card-type-power';
    return '';
  }

  export const CardUI = {
    getCardTypeClass(type) {
      return _getCardTypeClass(type);
    },

    getCardTypeLabelClass(type) {
      return _getCardTypeLabelClass(type);
    },

    renderCombatCards(deps = {}) {
      const gs = deps.gs;
      const data = deps.data;
      if (!gs?.player?.hand || !data?.cards) return;

      const doc = _getDoc(deps);
      const zone = doc.getElementById('combatHandCards');
      if (!zone) return;

      const playCardHandler = deps.playCardHandler || GS?.playCard;
      const dragStartHandler = deps.dragStartHandler || window.handleCardDragStart;
      const dragEndHandler = deps.dragEndHandler || window.handleCardDragEnd;
      const showTooltipHandler = deps.showTooltipHandler || window.showTooltip;
      const hideTooltipHandler = deps.hideTooltipHandler || window.hideTooltip;

      const handSize = gs.player.hand.length;
      const cardScale = handSize <= 5 ? 1.2 : handSize <= 7 ? 1.05 : 0.95;
      const cardW = Math.round(100 * cardScale);
      const cardH = Math.round(146 * cardScale);
      const cardFontScale = cardScale < 1 ? `font-size:${Math.round(10 * cardScale)}px;` : '';

      zone.innerHTML = '';
      gs.player.hand.forEach((cardId, i) => {
        const card = data.cards[cardId];
        if (!card) return;

        const rarityClass = `rarity-${card.rarity || 'common'}`;

        const { displayCost: cost, isFree } = CardCostUtils.getCostDisplay(cardId, card, gs.player);
        const canPlay = gs.player.energy >= cost;
        const disc = gs.player.costDiscount || 0;
        const isCascadeFree = CardCostUtils.isCascadeFree(cardId, gs.player);
        const isChargeFree = CardCostUtils.isChargeFree(cardId, gs.player);
        const rarityBorder = card.rarity === 'rare'
          ? 'rgba(240,180,41,0.5)'
          : card.rarity === 'uncommon'
            ? 'rgba(123,47,255,0.5)'
            : '';
        const isUpgraded = card.upgraded ? 'box-shadow:0 0 15px rgba(0,255,204,0.6), inset 0 0 10px rgba(0,255,204,0.2); border-width:2px; border-color:var(--cyan);' : '';
        const typeClass = _getCardTypeClass(card.type);
        const typeLabelClass = _getCardTypeLabelClass(card.type);

        const el = doc.createElement('div');
        el.className = `card ${canPlay ? 'playable' : ''} ${typeClass} ${rarityClass}`;
        el.style.cssText = `width:${cardW}px;height:${cardH}px;${cardFontScale}${rarityBorder ? `border-color:${rarityBorder};` : ''}${isUpgraded}animation-delay:${i * 0.05}s;`;
        el.draggable = true;

        if (playCardHandler) el.addEventListener('click', () => playCardHandler(cardId, i));
        if (dragStartHandler) el.addEventListener('dragstart', (e) => dragStartHandler(e, cardId, i));
        if (dragEndHandler) el.addEventListener('dragend', (e) => dragEndHandler(e));
        if (showTooltipHandler) el.addEventListener('mouseenter', (e) => showTooltipHandler(e, cardId));
        if (hideTooltipHandler) el.addEventListener('mouseleave', () => hideTooltipHandler());

        el.innerHTML = `
            ${i < 5 ? `<div class="card-hotkey ${canPlay ? '' : 'disabled'}">${i + 1}</div>` : ''}
            <div class="card-cost" style="${!canPlay ? 'background:rgba(80,80,80,0.4);border-color:rgba(150,150,150,0.3);' : (isCascadeFree || isChargeFree) && card.cost > 0 ? 'background:rgba(0,255,204,0.2);border-color:rgba(0,255,204,0.7);color:#00ffcc;' : disc > 0 && card.cost > 0 ? 'background:rgba(0,255,100,0.25);border-color:rgba(0,255,100,0.6);color:#00ff88;' : ''}">${cost}${(isCascadeFree || isChargeFree) && card.cost > 0 ? `<span style="position:absolute;top:-4px;left:-4px;font-size:7px;color:#00ffcc;background:rgba(0,30,20,0.9);border-radius:3px;padding:1px 2px;line-height:1;">FREE</span>` : disc > 0 && card.cost > 0 ? `<span style="position:absolute;top:-4px;left:-4px;font-size:7px;color:#00ff88;background:rgba(0,30,10,0.9);border-radius:3px;padding:1px 2px;line-height:1;">-${Math.min(disc, card.cost)}</span>` : ''}</div>
            <div class="card-icon" style="${cardScale < 1 ? `font-size:${Math.round(40 * cardScale)}px;` : 'font-size:40px;'}">
              ${card.icon}
            </div>
            <div class="card-name" style="${cardScale < 1 ? `font-size:${Math.round(12 * cardScale)}px;` : 'font-size:14px;'}">${card.name}${card.upgraded ? '<span style="color:var(--cyan);font-size:10px;"> ✦</span>' : ''}</div>
            <div class="card-desc" style="display:none;">${DescriptionUtils ? DescriptionUtils.highlight(card.desc) : card.desc}</div>
            <div class="card-type ${typeLabelClass}">${card.type}</div>
        `;
        zone.appendChild(el);
      });

      this.updateHandFanEffect({ doc });
    },

    renderHand(deps = {}) {
      const gs = deps.gs;
      const data = deps.data;
      if (!gs?.player?.hand || !data?.cards) return;

      const doc = _getDoc(deps);
      const zone = doc.getElementById('handCards');
      if (!zone) return;

      const playCardHandler = deps.playCardHandler || GS?.playCard;
      const renderCombatCardsHandler = deps.renderCombatCardsHandler || window.renderCombatCards;

      zone.innerHTML = '';
      gs.player.hand.forEach((cardId, i) => {
        const card = data.cards[cardId];
        if (!card) return;

        const el = doc.createElement('div');
        el.className = `card rarity-${card.rarity || 'common'}`;
        el.title = card.desc;

        el.addEventListener('click', () => {
          if (playCardHandler) playCardHandler(cardId, i);
          if (renderCombatCardsHandler) renderCombatCardsHandler();
        });

        el.innerHTML = `
            <div class="card-cost">${card.cost}</div>
            <div class="card-icon">${card.icon}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-desc">${DescriptionUtils ? DescriptionUtils.highlight(card.desc) : card.desc}</div>
            <div class="card-type">${card.type}</div>
        `;
        zone.appendChild(el);
      });
    },

    updateHandFanEffect(deps = {}) {
      const doc = _getDoc(deps);
      const cards = doc.querySelectorAll('#combatHandCards .card');
      const n = cards.length;
      if (n === 0) return;

      const mid = (n - 1) / 2;
      const spread = Math.min(16, Math.max(6, n * 2));
      cards.forEach((card, i) => {
        const ratio = mid === 0 ? 0 : (i - mid) / mid;
        const angle = ratio * spread;
        const yOffset = Math.abs(i - mid) * 2;
        card.style.transformOrigin = 'bottom center';
        card.style.transform = `rotate(${angle.toFixed(2)}deg) translateY(${yOffset.toFixed(2)}px)`;
      });
    },
  };
