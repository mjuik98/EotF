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

export function closeCodexDetailPopup(state, doc) {
  closeCodexPopup(doc);
  clearCodexPopupNavigation(state);
}

function ensurePopupShell(state, doc) {
  return ensureCodexPopupOverlay(doc, () => closeCodexDetailPopup(state, doc));
}

function setPopupTheme(doc, theme) {
  setCodexPopupTheme(doc, theme.bg1, theme.bg2, theme.border, theme.glow);
}

function bindPopupNavigation(state, doc, reopen) {
  setCodexPopupNavigation(state, null, null, reopen);
  doc.getElementById('cxNavPrev')?.addEventListener('click', () => navigateCodexPopup(state, -1));
  doc.getElementById('cxNavNext')?.addEventListener('click', () => navigateCodexPopup(state, 1));
}

export function mountPopup(state, doc, payload, reopen) {
  ensurePopupShell(state, doc);
  setPopupTheme(doc, payload.theme);
  const box = doc.getElementById('cxPopupBox');
  if (!box) return;
  box.innerHTML = payload.html;
  doc.getElementById('cxPopupClose')?.addEventListener('click', () => closeCodexDetailPopup(state, doc));
  bindPopupNavigation(state, doc, reopen);
  openCodexPopup(doc);
}
