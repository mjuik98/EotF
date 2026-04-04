import {
  getCodexDoc,
  highlightCodexDescription,
} from './codex_ui_helpers.js';
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

let codexPopupPayloadBuildersPromise = null;

async function loadCodexPopupPayloadBuilders() {
  if (!codexPopupPayloadBuildersPromise) {
    codexPopupPayloadBuildersPromise = import('./codex_ui_popup_payloads.js').catch((error) => {
      codexPopupPayloadBuildersPromise = null;
      throw error;
    });
  }
  return codexPopupPayloadBuildersPromise;
}

async function openCodexPopupEntry(state, entry, list, reopen, payloadBuilderName) {
  const deps = state.deps;
  if (list !== undefined) setCodexPopupNavigation(state, entry, list, reopen);
  const payloadBuilders = await loadCodexPopupPayloadBuilders();
  const buildPayload = payloadBuilders?.[payloadBuilderName];
  if (typeof buildPayload !== 'function') return;
  const payload = buildPayload(entry, {
    gs: deps.gs,
    data: deps.data,
    safeHtml: highlightCodexDescription,
    quoteHtml: buildCodexQuoteBlock(entry.quote, highlightCodexDescription),
    navHtml: buildCodexNavBlock(state.popupList, state.popupIndex),
  });
  mountPopup(state, getCodexDoc(deps), payload, reopen);
}

export function openEnemyCodexPopup(state, enemy, list) {
  const reopen = (entry, popupList) => openEnemyCodexPopup(state, entry, popupList);
  return openCodexPopupEntry(state, enemy, list, reopen, 'buildEnemyPopupPayload');
}

export function openCardCodexPopup(state, card, list) {
  const reopen = (entry, popupList) => openCardCodexPopup(state, entry, popupList);
  return openCodexPopupEntry(state, card, list, reopen, 'buildCardPopupPayload');
}

export function openItemCodexPopup(state, item, list) {
  const reopen = (entry, popupList) => openItemCodexPopup(state, entry, popupList);
  return openCodexPopupEntry(state, item, list, reopen, 'buildItemPopupPayload');
}
