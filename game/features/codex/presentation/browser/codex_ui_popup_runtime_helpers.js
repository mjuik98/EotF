import {
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
import { registerEscapeSurface } from '../../../../shared/runtime/overlay_escape_support.js';

export function closeCodexDetailPopup(state, doc) {
  closeCodexPopup(doc);
  clearCodexPopupNavigation(state);
}

function ensurePopupShell(state, doc) {
  const closePopup = () => closeCodexDetailPopup(state, doc);
  if (state._popupEscapeDoc !== doc) {
    state._popupEscapeCleanup?.();
    state._popupEscapeDoc = doc;
    state._popupEscapeCleanup = registerEscapeSurface(doc, 'codexDetail', {
      close: closePopup,
      isVisible: ({ doc: popupDoc }) => popupDoc?.getElementById?.('cxDetailPopup')?.classList?.contains?.('open'),
      priority: 400,
      scopes: ['run', 'title'],
    });
  }
  return ensureCodexPopupOverlay(doc, closePopup);
}

export function mountPopup(state, doc, payload, reopen) {
  ensurePopupShell(state, doc);
  const closePopup = () => closeCodexDetailPopup(state, doc);
  setCodexPopupTheme(doc, payload.theme.bg1, payload.theme.bg2, payload.theme.border, payload.theme.glow);
  const box = doc.getElementById('cxPopupBox');
  if (!box) return;
  box.innerHTML = payload.html;
  doc.getElementById('cxPopupClose')?.addEventListener('click', closePopup);
  setCodexPopupNavigation(state, null, null, reopen);
  doc.getElementById('cxNavPrev')?.addEventListener('click', () => navigateCodexPopup(state, -1));
  doc.getElementById('cxNavNext')?.addEventListener('click', () => navigateCodexPopup(state, 1));
  openCodexPopup(doc);
}
