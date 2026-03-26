import { ensureEventModalShell } from '../../platform/browser/ensure_event_modal_shell.js';
import { renderChoices } from './event_ui_dom.js';
import { applyEventShellCopy } from './event_text_surface.js';

export function renderEventShellRuntime(event, { doc, gs, refreshGoldBar, resolveChoice }) {
  ensureEventModalShell(doc);
  const eyebrowEl = doc.getElementById('eventEyebrow');
  const titleEl = doc.getElementById('eventTitle');
  const descEl = doc.getElementById('eventDesc');
  const imgContEl = doc.getElementById('eventImageContainer');

  applyEventShellCopy({ eyebrowEl, titleEl, descEl, event });
  if (imgContEl) imgContEl.style.display = 'none';

  refreshGoldBar?.();
  renderChoices(event, doc, gs, resolveChoice);
  doc.getElementById('eventModal')?.classList?.add('active');
}
