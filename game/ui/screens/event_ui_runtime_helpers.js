import { renderChoices } from './event_ui_dom.js';
import { showEventItemShopOverlay } from './event_ui_item_shop.js';
import { showEventRestSiteOverlay } from './event_ui_rest_site.js';
import { createEventShop } from './event_ui_shop.js';

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

export function openEventShopRuntime(deps = {}, { gs, data, runRules, showItemShop }) {
  return createEventShop(gs, data, runRules, deps, { showItemShop });
}

export function openEventRestSiteRuntime(deps = {}, options) {
  showEventRestSiteOverlay(options.gs, options.data, options.runRules, {
    ...deps,
    doc: options.doc,
    audioEngine: options.audioEngine,
    showCardDiscard: options.showCardDiscard,
    showEvent: options.showEvent,
  });
}

export function openEventItemShopRuntime(gsArg, deps = {}, { gs, data, runRules, refreshEventGoldBar }) {
  showEventItemShopOverlay(gsArg || gs, data, runRules, {
    ...deps,
    refreshEventGoldBar,
  });
}
