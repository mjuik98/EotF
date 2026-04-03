import { renderChoices } from '../../presentation/browser/event_ui_dom.js';
import { dismissEventModal } from '../../presentation/browser/event_ui_helpers.js';
import {
  openEventItemShopRuntime,
  openEventRestSiteRuntime,
  openEventShopRuntime,
  renderEventShellRuntime,
  showEventCardDiscardOverlay,
} from '../../presentation/browser/event_ui_runtime_helpers.js';

export function createEventRuntimeDomActions() {
  return {
    dismissEventModal(modal, onDone, deps = {}) {
      return dismissEventModal(modal, onDone, deps);
    },

    renderEventChoices(event, doc, gs, onResolve) {
      return renderChoices(event, doc, gs, onResolve);
    },

    renderEventShell: renderEventShellRuntime,
    openEventItemShop: openEventItemShopRuntime,
    openEventRestSite: openEventRestSiteRuntime,
    openEventShop: openEventShopRuntime,
    showEventCardDiscard: showEventCardDiscardOverlay,
  };
}
