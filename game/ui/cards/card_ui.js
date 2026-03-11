import { HandCardCloneUI } from './card_clone_ui.js';
import { applyHandFanStyles, createCombatCardElement } from './combat_card_render_ui.js';
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
    if (!cardCostUtils) return;

    // 클론 레이어를 body 에 생성 (최초 1회 동작)
    HandCardCloneUI.init({ doc });

    const handSize = gs.player.hand.length;
    const cardScale = handSize <= 5 ? 1.2 : handSize <= 7 ? 1.05 : 0.95;
    const cardW = Math.round(100 * cardScale);
    const cardH = Math.round(146 * cardScale);
    const cardFontScale = cardScale < 1 ? `font-size:${Math.round(10 * cardScale)}px;` : '';

    zone.textContent = '';

    // 기존 클론 즉각 파기
    HandCardCloneUI.destroyAll({ doc });

    gs.player.hand.forEach((cardId, i) => {
      const card = data.cards[cardId];
      if (!card) return;

      const displayMax = cardCostUtils.getCostDisplay(cardId, card, gs.player, i);
      const { displayCost: cost } = displayMax;
      const effectiveCost = cardCostUtils.calcEffectiveCost(cardId, card, gs.player, i);
      const canPlay = gs.player.energy >= effectiveCost;

      const nextDisc = gs.player._nextCardDiscount || 0;
      const baseDisc = gs.player.costDiscount || 0;
      const traitDisc = cardCostUtils.hasTraitDiscount?.(cardId, gs.player) ? 1 : 0;
      const totalDisc = nextDisc + baseDisc + traitDisc;

      const isCascadeFree = cardCostUtils.isCascadeFree(cardId, gs.player, i);
      const isChargeFree = cardCostUtils.isChargeFree(cardId, gs.player, i);
      const anyFree = isCascadeFree || isChargeFree;
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
      });

      // ── 이벤트 핸들러 ──────────────────────────────────────────
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

      // ── 호버 클론 생성 및 이벤트 바인딩 ───────────────────────
      HandCardCloneUI.attachToCard(el, cardId, card, {
        displayCost: cost, canPlay, anyFree, totalDisc: Math.min(totalDisc, card.cost || 0),
      }, { doc });

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

    const playCardHandler = deps.playCardHandler;
    const renderCombatCardsHandler = deps.renderCombatCardsHandler;

    zone.textContent = '';
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

      const cost = doc.createElement('div'); cost.className = 'card-cost'; cost.textContent = card.cost;
      const icon = doc.createElement('div'); icon.className = 'card-icon'; icon.textContent = card.icon;
      const name = doc.createElement('div'); name.className = 'card-name'; name.textContent = card.name;
      // 설명 텍스트 창 제거
      const type = doc.createElement('div'); type.className = 'card-type'; type.textContent = card.type;
      el.append(cost, icon, name, type);
      zone.appendChild(el);
    });
  },

  updateHandFanEffect(deps = {}) {
    const doc = _getDoc(deps);
    const cards = doc.querySelectorAll('#combatHandCards .card');
    applyHandFanStyles(Array.from(cards));
  },
};
