import { renderChoices } from '../../../ui/screens/event_ui_dom.js';
import { dismissEventModal } from '../../../ui/screens/event_ui_helpers.js';
import { showEventCardDiscardOverlay } from '../../../ui/screens/event_ui_card_discard.js';
import {
  openEventItemShopRuntime,
  openEventRestSiteRuntime,
  openEventShopRuntime,
  renderEventShellRuntime,
} from '../../../presentation/screens/event_ui_runtime_helpers.js';

export function dismissEventModalRuntime(modal, onDone, deps = {}) {
  return dismissEventModal(modal, onDone, deps);
}

export function renderEventChoices(event, doc, gs, onResolve) {
  return renderChoices(event, doc, gs, onResolve);
}

export {
  openEventItemShopRuntime,
  openEventRestSiteRuntime,
  openEventShopRuntime,
  renderEventShellRuntime,
  showEventCardDiscardOverlay,
};
