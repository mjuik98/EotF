import { showEventItemShopOverlay } from '../../ui/screens/event_ui_item_shop.js';
import { renderEventShellRuntime } from './event_runtime_shell_presenter.js';
import { showEventRestSiteOverlay } from './event_rest_site_presenter.js';
import { createEventShop } from './event_shop_presenter.js';

export { renderEventShellRuntime };

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
