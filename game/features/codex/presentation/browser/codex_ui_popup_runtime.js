import {
  getCodexDoc,
  highlightCodexDescription,
} from './codex_ui_helpers.js';
import {
  buildCardPopupPayload,
  buildEnemyPopupPayload,
  buildItemPopupPayload,
} from './codex_ui_popup.js';
import {
  buildCodexNavBlock,
  buildCodexQuoteBlock,
} from './codex_ui_popup_blocks.js';
import {
  setCodexPopupNavigation,
} from './codex_ui_controller.js';
import {
  closeCodexDetailPopup,
  mountPopup,
} from './codex_ui_popup_runtime_helpers.js';

export { closeCodexDetailPopup };

export function openEnemyCodexPopup(state, enemy, list) {
  const reopen = (entry, popupList) => openEnemyCodexPopup(state, entry, popupList);
  const deps = state.deps;
  if (list !== undefined) setCodexPopupNavigation(state, enemy, list, reopen);
  const payload = buildEnemyPopupPayload(enemy, {
    gs: deps?.gs,
    safeHtml: highlightCodexDescription,
    quoteHtml: buildCodexQuoteBlock(enemy.quote),
    navHtml: buildCodexNavBlock(state.popupList, state.popupIndex),
  });
  mountPopup(state, getCodexDoc(deps), payload, reopen);
}

export function openCardCodexPopup(state, card, list) {
  const reopen = (entry, popupList) => openCardCodexPopup(state, entry, popupList);
  const deps = state.deps;
  if (list !== undefined) setCodexPopupNavigation(state, card, list, reopen);
  const payload = buildCardPopupPayload(card, {
    gs: deps?.gs,
    data: deps?.data,
    safeHtml: highlightCodexDescription,
    quoteHtml: buildCodexQuoteBlock(card.quote),
    navHtml: buildCodexNavBlock(state.popupList, state.popupIndex),
  });
  mountPopup(state, getCodexDoc(deps), payload, reopen);
}

export function openItemCodexPopup(state, item, list) {
  const reopen = (entry, popupList) => openItemCodexPopup(state, entry, popupList);
  const deps = state.deps;
  if (list !== undefined) setCodexPopupNavigation(state, item, list, reopen);
  const payload = buildItemPopupPayload(item, {
    gs: deps?.gs,
    data: deps?.data,
    safeHtml: highlightCodexDescription,
    quoteHtml: buildCodexQuoteBlock(item.quote),
    navHtml: buildCodexNavBlock(state.popupList, state.popupIndex),
  });
  mountPopup(state, getCodexDoc(deps), payload, reopen);
}
