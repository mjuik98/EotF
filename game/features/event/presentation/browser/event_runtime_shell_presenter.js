import { ensureEventModalShell } from '../../platform/browser/ensure_event_modal_shell.js';
import { renderChoices } from './event_ui_dom.js';
import { DomSafe } from '../../../ui/ports/public_feature_support_capabilities.js';

export function renderEventShellRuntime(event, { doc, gs, refreshGoldBar, resolveChoice }) {
  ensureEventModalShell(doc);
  const eyebrowEl = doc.getElementById('eventEyebrow');
  const titleEl = doc.getElementById('eventTitle');
  const descEl = doc.getElementById('eventDesc');
  const imgContEl = doc.getElementById('eventImageContainer');

  if (eyebrowEl) eyebrowEl.textContent = event.eyebrow || 'LAYER 1 EVENT';
  if (titleEl) titleEl.textContent = event.title;
  if (descEl) DomSafe.setHighlightedText(descEl, event.desc);
  if (imgContEl) imgContEl.style.display = 'none';

  refreshGoldBar?.();
  renderChoices(event, doc, gs, resolveChoice);
  doc.getElementById('eventModal')?.classList?.add('active');
}
