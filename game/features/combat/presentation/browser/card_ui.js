import { HandCardCloneUI } from './card_clone_ui.js';
import {
  applyHandFanStyles,
  createCombatCardElement,
} from './combat_card_render_ui.js';
import {
  createUnifiedParticles,
  getCardTypeClass,
  getCardTypeLabelClass,
} from './card_render_helpers_ui.js';

function _getDoc(deps) {
  return deps?.doc || document;
}

function _getCardCostUtils(deps) {
  return deps?.cardCostUtils || deps?.CardCostUtils || null;
}

export const CardUI = {
  getCardTypeClass(type) {
    return getCardTypeClass(type);
  },

  getCardTypeLabelClass(type) {
    return getCardTypeLabelClass(type);
  },

  createUnifiedParticles(doc, color, options) {
    return createUnifiedParticles(doc, color, options);
  },

  renderCombatCards(deps = {}) {
    const gs = deps.gs;
    const data = deps.data;
    if (!gs?.player?.hand || !data?.cards) return;

    const doc = _getDoc(deps);
    const zone = doc.getElementById('combatHandCards');
    if (!zone) return;

    const playCardHandler = deps.playCardHandler;
    const dragStartHandler = deps.dragStartHandler;
    const dragEndHandler = deps.dragEndHandler;
    const cardCostUtils = _getCardCostUtils(deps);
    const descriptionUtils = deps.descriptionUtils || deps.DescriptionUtils || null;
    const triggerItems = typeof gs?.triggerItems === 'function'
      ? gs.triggerItems.bind(gs)
      : gs?.triggerItems;
    if (!cardCostUtils) return;

    HandCardCloneUI.init({ doc });

    const handSize = gs.player.hand.length;
    const cardScale = handSize <= 5 ? 1.2 : handSize <= 7 ? 1.05 : 0.95;
    const cardW = Math.round(100 * cardScale);
    const cardH = Math.round(146 * cardScale);
    const cardFontScale = cardScale < 1 ? `font-size:${Math.round(10 * cardScale)}px;` : '';

    zone.textContent = '';
    HandCardCloneUI.destroyAll({ doc });

    gs.player.hand.forEach((cardId, i) => {
      const card = data.cards[cardId];
      if (!card) return;

      const costState = cardCostUtils.getCostDisplay(cardId, card, gs.player, i, {
        triggerItems,
      });
      const cost = costState.displayCost;
      const canPlay = !!costState.canPlay;
      const totalDisc = Math.min(Number(costState.totalDiscount || 0), card.cost || 0);
      const anyFree = !!costState.anyFree;
      const el = createCombatCardElement(doc, {
        cardId,
        handIndex: i,
        card,
        canPlay,
        displayCost: cost,
        anyFree,
        totalDisc,
        cardW,
        cardH,
        cardFontScale,
        descriptionUtils,
      });

      if (playCardHandler) {
        el.addEventListener('click', async (e) => {
          e.stopPropagation();
          if (zone.dataset.locked === 'true') return;
          zone.dataset.locked = 'true';
          zone.style.pointerEvents = 'none';
          try {
            await playCardHandler(cardId, i);
          } finally {
            zone.dataset.locked = 'false';
            zone.style.pointerEvents = '';
          }
        });
      }
      if (dragStartHandler) el.addEventListener('dragstart', (e) => dragStartHandler(e, cardId, i));
      if (dragEndHandler) el.addEventListener('dragend', (e) => dragEndHandler(e));

      HandCardCloneUI.attachToCard(el, cardId, card, {
        displayCost: cost, canPlay, anyFree, totalDisc,
      }, { doc, descriptionUtils });

      zone.appendChild(el);
    });

    this.updateHandFanEffect({ doc });
  },

  renderHand(deps = {}) {
    this.renderCombatCards(deps);
  },

  updateHandFanEffect(deps = {}) {
    const doc = _getDoc(deps);
    const cards = doc.querySelectorAll('#combatHandCards .card');
    applyHandFanStyles(Array.from(cards));
  },
};
