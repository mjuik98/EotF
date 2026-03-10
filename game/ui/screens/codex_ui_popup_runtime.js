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
  closeCodexPopup,
  ensureCodexPopupOverlay,
  openCodexPopup,
  setCodexPopupTheme,
} from './codex_ui_popup.js';
import {
  clearCodexPopupNavigation,
  navigateCodexPopup,
  setCodexPopupNavigation,
} from './codex_ui_controller.js';

export function closeCodexDetailPopup(state, doc) {
  closeCodexPopup(doc);
  clearCodexPopupNavigation(state);
}

function ensurePopupShell(state, doc) {
  return ensureCodexPopupOverlay(doc, (popupDoc) => closeCodexDetailPopup(state, popupDoc));
}

function setPopupTheme(doc, theme) {
  setCodexPopupTheme(doc, theme.bg1, theme.bg2, theme.border, theme.glow);
}

function quoteBlock(quote) {
  return buildCodexQuoteBlock(quote);
}

function navBlock(state) {
  return buildCodexNavBlock(state.popupList, state.popupIndex);
}

function bindPopupNavigation(state, doc, reopen) {
  setCodexPopupNavigation(state, null, null, reopen);
  doc.getElementById('cxNavPrev')?.addEventListener('click', () => navigateCodexPopup(state, -1));
  doc.getElementById('cxNavNext')?.addEventListener('click', () => navigateCodexPopup(state, 1));
}

function mountPopup(state, doc, payload, reopen) {
  ensurePopupShell(state, doc);
  setPopupTheme(doc, payload.theme);
  const box = doc.getElementById('cxPopupBox');
  if (!box) return;
  box.innerHTML = payload.html;
  doc.getElementById('cxPopupClose')?.addEventListener('click', () => closeCodexDetailPopup(state, doc));
  bindPopupNavigation(state, doc, reopen);
  openCodexPopup(doc);
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
