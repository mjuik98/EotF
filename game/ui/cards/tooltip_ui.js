import {
  hideGeneralTooltipUi,
  showGeneralTooltipUi,
} from './tooltip_general_ui.js';
import {
  hideItemTooltipUi,
  showItemTooltipUi,
} from './tooltip_item_ui.js';
import {
  extractTooltipCardId,
  positionCardTooltip,
  renderCardTooltipContent,
  syncCardKeywordTooltip,
} from './tooltip_card_render_ui.js';

let _tooltipTimer = null;

function _getDoc(deps) {
  return deps?.doc || document;
}

function _getWin(deps) {
  return deps?.win || window;
}

export const TooltipUI = {
  showTooltip(event, cardId, deps = {}) {
    const data = deps.data;
    const gs = deps.gs;
    if (!data?.cards || !gs) return;

    // 특수 툴팁: 스킬 소각
    if (cardId === 'remove_card') {
      this.showGeneralTooltip(event, '🔥 스킬 소각', '덱에서 원하는 카드 1장을 영구히 제거합니다.<br><br>조건: 덱에 카드가 있어야 합니다.', deps);
      return;
    }

    const card = data.cards[cardId];
    if (!card) return;
    clearTimeout(_tooltipTimer);
    const doc = _getDoc(deps);
    const win = _getWin(deps);
    const tt = doc.getElementById('cardTooltip');
    if (!tt) return;

    renderCardTooltipContent(doc, card, gs, { cardId });
    const position = positionCardTooltip(event, tt, win);
    tt.classList.add('visible');
    syncCardKeywordTooltip(doc, card, position, win);
  },

  hideTooltip(deps = {}) {
    const doc = _getDoc(deps);
    _tooltipTimer = setTimeout(() => {
      doc.getElementById('cardTooltip')?.classList.remove('visible');
      const st = doc.getElementById('subTooltip');
      if (st) st.style.display = 'none';
    }, 80);
  },

  attachCardTooltips(deps = {}) {
    const doc = _getDoc(deps);
    doc.querySelectorAll('#combatHandCards .card, #deckModalCards > div').forEach(el => {
      el.addEventListener('mouseenter', (e) => {
        const cardId = extractTooltipCardId(el.getAttribute('onclick'));
        if (cardId) this.showTooltip(e, cardId, deps);
      });
      el.addEventListener('mouseleave', () => this.hideTooltip(deps));
    });
  },

  showItemTooltip(event, itemId, deps = {}) {
    showItemTooltipUi(event, itemId, deps);
  },

  hideItemTooltip(deps = {}) {
    hideItemTooltipUi(deps);
  },

  showGeneralTooltip(event, title, content, deps = {}) {
    showGeneralTooltipUi(event, title, content, deps);
  },

  hideGeneralTooltip(deps = {}) {
    hideGeneralTooltipUi(deps);
  }
};
