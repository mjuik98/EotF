'use strict';

(function initCardUI(globalObj) {
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

  const CardUI = {
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

      const playCardHandlerName = deps.playCardHandlerName || 'GS.playCard';
      const dragStartHandlerName = deps.dragStartHandlerName || 'handleCardDragStart';
      const dragEndHandlerName = deps.dragEndHandlerName || 'handleCardDragEnd';
      const showTooltipHandlerName = deps.showTooltipHandlerName || 'showTooltip';
      const hideTooltipHandlerName = deps.hideTooltipHandlerName || 'hideTooltip';

      const handSize = gs.player.hand.length;
      const cardScale = handSize <= 5 ? 1 : handSize <= 7 ? 0.87 : 0.75;
      const cardW = Math.round(96 * cardScale);
      const cardH = Math.round(140 * cardScale);
      const cardFontScale = cardScale < 1 ? `font-size:${Math.round(10 * cardScale)}px;` : '';

      zone.innerHTML = gs.player.hand.map((cardId, i) => {
        const card = data.cards[cardId];
        if (!card) return '';

        const disc = gs.player.costDiscount || 0;
        const isCascadeFree = gs.player._cascadeCards && gs.player._cascadeCards.has(cardId);
        const cost = (gs.player.zeroCost || isCascadeFree) ? 0 : Math.max(0, card.cost - disc);
        const canPlay = gs.player.energy >= cost;
        const rarityBorder = card.rarity === 'rare'
          ? 'rgba(240,180,41,0.4)'
          : card.rarity === 'uncommon'
            ? 'rgba(123,47,255,0.4)'
            : '';
        const isUpgraded = card.upgraded ? 'box-shadow:0 0 12px rgba(0,255,204,0.4);' : '';
        const typeClass = _getCardTypeClass(card.type);
        const typeLabelClass = _getCardTypeLabelClass(card.type);

        return `
          <div class="card ${canPlay ? 'playable' : ''} ${typeClass}"
            style="width:${cardW}px;height:${cardH}px;${cardFontScale}${rarityBorder ? `border-color:${rarityBorder};` : ''}${isUpgraded}animation-delay:${i * 0.05}s;"
            draggable="true"
            onclick="${playCardHandlerName}('${cardId}',${i})"
            ondragstart="${dragStartHandlerName}(event,'${cardId}',${i})"
            ondragend="${dragEndHandlerName}(event)"
            onmouseenter="${showTooltipHandlerName}(event,'${cardId}')"
            onmouseleave="${hideTooltipHandlerName}()">
            ${i < 5 ? `<div style="position:absolute;top:3px;left:3px;font-family:'Share Tech Mono',monospace;font-size:8px;color:${canPlay ? 'rgba(0,255,204,0.7)' : 'rgba(120,120,140,0.5)'};background:rgba(3,3,10,0.7);border:1px solid ${canPlay ? 'rgba(0,255,204,0.3)' : 'rgba(120,120,140,0.2)'};border-radius:3px;width:13px;height:13px;display:flex;align-items:center;justify-content:center;line-height:1;z-index:1;">${i + 1}</div>` : ''}
            <div class="card-cost" style="${!canPlay ? 'background:rgba(80,80,80,0.4);border-color:rgba(150,150,150,0.3);' : isCascadeFree && card.cost > 0 ? 'background:rgba(0,255,204,0.2);border-color:rgba(0,255,204,0.7);color:#00ffcc;' : disc > 0 && card.cost > 0 ? 'background:rgba(0,255,100,0.25);border-color:rgba(0,255,100,0.6);color:#00ff88;' : ''}">${cost}${isCascadeFree && card.cost > 0 ? `<span style="position:absolute;top:-4px;right:-4px;font-size:7px;color:#00ffcc;background:rgba(0,30,20,0.9);border-radius:3px;padding:1px 2px;line-height:1;">FREE</span>` : disc > 0 && card.cost > 0 ? `<span style="position:absolute;top:-4px;right:-4px;font-size:7px;color:#00ff88;background:rgba(0,30,10,0.9);border-radius:3px;padding:1px 2px;line-height:1;">-${Math.min(disc, card.cost)}</span>` : ''}</div>
            <div class="card-icon" style="${cardScale < 1 ? `font-size:${Math.round(22 * cardScale)}px;` : ''}">${card.icon}</div>
            <div class="card-name" style="${cardScale < 1 ? `font-size:${Math.round(11 * cardScale)}px;` : ''}">${card.name}${card.upgraded ? '<span style="color:var(--cyan);font-size:7px;"> ✦</span>' : ''}</div>
            <div class="card-desc" style="${cardScale < 1 ? `font-size:${Math.round(11 * cardScale)}px;` : ''}">${card.desc}</div>
            <div class="card-type ${typeLabelClass}">${card.type}</div>
          </div>
        `;
      }).join('');

      this.updateHandFanEffect({ doc });
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

  globalObj.CardUI = CardUI;
})(window);
