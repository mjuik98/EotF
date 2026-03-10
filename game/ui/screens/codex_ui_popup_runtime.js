import {
  getCodexDoc,
  highlightCodexDescription,
} from './codex_ui_helpers.js';
import {
  buildCardPopupPayload,
  buildCodexNavBlock,
  buildCodexQuoteBlock,
  buildEnemyPopupPayload,
  buildItemPopupPayload,
} from './codex_ui_popup.js';
import {
  setCodexPopupNavigation,
} from './codex_ui_controller.js';
import {
  closeCodexDetailPopup,
  mountPopup,
} from './codex_ui_popup_runtime_helpers.js';

export { closeCodexDetailPopup };

function quoteBlock(quote) {
  return buildCodexQuoteBlock(quote);
}

function navBlock(state) {
  return buildCodexNavBlock(state.popupList, state.popupIndex);
}

export function openEnemyCodexPopup(state, enemy, list) {
  if (list !== undefined) {
    setCodexPopupNavigation(state, enemy, list, (entry, popupList) => openEnemyCodexPopup(state, entry, popupList));
  }
  const doc = getCodexDoc(state.deps);
  const payload = buildEnemyPopupPayload(enemy, {
    gs: state.deps?.gs,
    safeHtml: highlightCodexDescription,
    quoteHtml: quoteBlock(enemy.quote),
    navHtml: navBlock(state),
  });
  mountPopup(state, doc, payload, (entry, popupList) => openEnemyCodexPopup(state, entry, popupList));
}

export function openCardCodexPopup(state, card, list) {
  if (list !== undefined) {
    setCodexPopupNavigation(state, card, list, (entry, popupList) => openCardCodexPopup(state, entry, popupList));
  }
  const doc = getCodexDoc(state.deps);
  const payload = buildCardPopupPayload(card, {
    gs: state.deps?.gs,
    data: state.deps?.data,
    safeHtml: highlightCodexDescription,
    quoteHtml: quoteBlock(card.quote),
    navHtml: navBlock(state),
  });
  mountPopup(state, doc, payload, (entry, popupList) => openCardCodexPopup(state, entry, popupList));
}

export function openItemCodexPopup(state, item, list) {
  if (list !== undefined) {
    setCodexPopupNavigation(state, item, list, (entry, popupList) => openItemCodexPopup(state, entry, popupList));
  }
  const doc = getCodexDoc(state.deps);
  const payload = buildItemPopupPayload(item, {
    gs: state.deps?.gs,
    data: state.deps?.data,
    safeHtml: highlightCodexDescription,
    quoteHtml: quoteBlock(item.quote),
    navHtml: navBlock(state),
  });
  mountPopup(state, doc, payload, (entry, popupList) => openItemCodexPopup(state, entry, popupList));
}
