export {
  buildCodexNavBlock,
  buildCodexQuoteBlock,
  buildCodexRecordBlock,
  buildCodexSetPopupBlock,
} from './codex_ui_popup_blocks.js';
export {
  buildCardPopupPayload,
  buildEnemyPopupPayload,
  buildItemPopupPayload,
} from './codex_ui_popup_payloads.js';

export function ensureCodexPopupOverlay(doc, onBackdropClose) {
  let overlay = doc.getElementById('cxDetailPopup');
  if (!overlay) {
    overlay = doc.createElement('div');
    overlay.id = 'cxDetailPopup';
    overlay.className = 'cx-popup-overlay';
    overlay.innerHTML = '<div class="cx-popup-box" id="cxPopupBox"></div>';
    doc.body.appendChild(overlay);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) onBackdropClose?.();
    });
  }
  return overlay;
}

export function openCodexPopup(doc) {
  ensureCodexPopupOverlay(doc);
  doc.getElementById('cxDetailPopup')?.classList.add('open');
}

export function closeCodexPopup(doc) {
  doc.getElementById('cxDetailPopup')?.classList.remove('open');
}

export function setCodexPopupTheme(doc, bg1, bg2, border, glow) {
  const box = doc.getElementById('cxPopupBox');
  if (!box) return;
  box.style.setProperty('--pb1', bg1);
  box.style.setProperty('--pb2', bg2);
  box.style.setProperty('--pb-border', border);
  box.style.setProperty('--pb-glow', glow);
}
