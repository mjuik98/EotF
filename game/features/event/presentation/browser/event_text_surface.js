import { DomSafe } from '../../../ui/ports/public_dom_support_capabilities.js';

export function setEventDescriptionText(descEl, text) {
  if (!descEl) return;
  DomSafe.setHighlightedText(descEl, text || '');
}

export function applyEventShellCopy({ eyebrowEl, titleEl, descEl, event } = {}) {
  if (eyebrowEl) eyebrowEl.textContent = event?.eyebrow || 'LAYER 1 EVENT';
  if (titleEl) titleEl.textContent = event?.title || '';
  setEventDescriptionText(descEl, event?.desc || '');
}
