import { renderChoices } from '../../ui/screens/event_ui_dom.js';

export function renderEventShellRuntime(event, { doc, gs, refreshGoldBar, resolveChoice }) {
  const eyebrowEl = doc.getElementById('eventEyebrow');
  const titleEl = doc.getElementById('eventTitle');
  const descEl = doc.getElementById('eventDesc');
  const imgContEl = doc.getElementById('eventImageContainer');

  if (eyebrowEl) eyebrowEl.textContent = event.eyebrow || 'LAYER 1 EVENT';
  if (titleEl) titleEl.textContent = event.title;
  if (descEl) descEl.textContent = event.desc;
  if (imgContEl) imgContEl.style.display = 'none';

  refreshGoldBar?.();
  renderChoices(event, doc, gs, resolveChoice);
  doc.getElementById('eventModal')?.classList?.add('active');
}
