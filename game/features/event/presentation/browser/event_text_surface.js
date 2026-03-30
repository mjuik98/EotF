import { DomSafe } from '../../../../platform/browser/dom/public.js';

export function setEventDescriptionText(descEl, text) {
  if (!descEl) return;
  DomSafe.setHighlightedText(descEl, text || '');
}

export function applyEventShellCopy({ eyebrowEl, titleEl, descEl, event } = {}) {
  if (eyebrowEl) eyebrowEl.textContent = event?.eyebrow || 'LAYER 1 EVENT';
  if (titleEl) titleEl.textContent = event?.title || '';
  setEventDescriptionText(descEl, event?.desc || '');
}
