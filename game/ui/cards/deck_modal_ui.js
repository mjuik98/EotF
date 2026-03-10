import {
  applyDeckFilterButtonStyles,
  buildDeckModalEntries,
  renderDeckModalCards,
  renderDeckStatusBar,
} from './deck_modal_render_ui.js';
import {
  closeDeckModal,
  getDeckModalFilter,
  openDeckModal,
  resetDeckModalFilter,
  setDeckModalFilter,
} from './deck_modal_runtime_ui.js';

function _getDoc(deps) {
  return deps?.doc || document;
}

export const DeckModalUI = {
  resetFilter() {
    resetDeckModalFilter();
  },

  showDeckView(deps = {}) {
    this.renderDeckModal(deps);
    openDeckModal(deps);
  },

  renderDeckModal(deps = {}) {
    const gs = deps.gs;
    const data = deps.data;
    if (!gs?.player || !data?.cards) return;

    const doc = _getDoc(deps);
    const modal = doc.getElementById('deckViewModal');
    if (!modal) return;

    const summary = buildDeckModalEntries(gs, data, getDeckModalFilter());

    const bar = doc.getElementById('deckStatusBar');
    renderDeckStatusBar(doc, bar, summary);

    const countEl = doc.getElementById('deckModalCount');
    if (countEl) countEl.textContent = summary.deckCount;

    const cardsEl = doc.getElementById('deckModalCards');
    if (!cardsEl) return;
    renderDeckModalCards(doc, cardsEl, summary.entries, {
      showTooltip: globalThis.window?.showTooltip,
      hideTooltip: globalThis.window?.hideTooltip,
      highlightDescription: globalThis.window?.DescriptionUtils?.highlight,
    });
  },

  setDeckFilter(type, deps = {}) {
    setDeckModalFilter(type);
    const doc = _getDoc(deps);
    applyDeckFilterButtonStyles(doc, type);
    this.renderDeckModal(deps);
  },

  closeDeckView(deps = {}) {
    closeDeckModal(deps);
  },
};
