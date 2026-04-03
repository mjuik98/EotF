import { loadEventCardDiscardOverlay } from './load_event_card_discard_overlay.js';
import { loadEventItemShopOverlay } from './load_event_item_shop_overlay.js';
import { loadEventRestSiteOverlay } from './load_event_rest_site_overlay.js';
import { renderEventShellRuntime } from './event_runtime_shell_presenter.js';
import { createEventShop } from './event_shop_presenter.js';

export { renderEventShellRuntime };

export function openEventShopRuntime(deps = {}, { gs, data, runRules, showItemShop }) {
  return createEventShop(gs, data, runRules, deps, { showItemShop });
}

export async function openEventRestSiteRuntime(deps = {}, options) {
  const { showEventRestSiteOverlay } = await loadEventRestSiteOverlay();
  showEventRestSiteOverlay(options.gs, options.data, options.runRules, {
    ...deps,
    doc: options.doc,
    audioEngine: options.audioEngine,
    showCardDiscard: options.showCardDiscard,
    showEvent: options.showEvent,
  });
}

export async function openEventItemShopRuntime(gsArg, deps = {}, { gs, data, runRules, refreshEventGoldBar }) {
  const { showEventItemShopOverlay } = await loadEventItemShopOverlay();
  showEventItemShopOverlay(gsArg || gs, data, runRules, {
    ...deps,
    refreshEventGoldBar,
  });
}

export async function showEventCardDiscardOverlay(gs, data, isBurn = false, deps = {}) {
  const module = await loadEventCardDiscardOverlay();
  return module.showEventCardDiscardOverlay(gs, data, isBurn, deps);
}
