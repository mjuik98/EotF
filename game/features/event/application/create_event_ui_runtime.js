import {
  getCurrentEvent,
  resolveEventService,
  showEventService,
  triggerRandomEventService,
} from './event_service.js';
import { clearIdempotencyPrefix, runIdempotent } from './event_idempotency.js';
import {
  getAudioEngine,
  getData,
  getDoc,
  getEventId,
  getGS,
  getRunRules,
} from '../platform/event_runtime_context.js';
import { finishEventFlow, resolveEventChoiceFlow } from './workflows/event_choice_flow.js';
import { createEventChoiceFlowUi } from '../platform/browser/create_event_choice_flow_ui.js';
import {
  openEventItemShopRuntime,
  openEventRestSiteRuntime,
  openEventShopRuntime,
  renderEventShellRuntime,
  showEventCardDiscardOverlay,
} from '../platform/event_runtime_dom.js';

export function createEventUiCallbacks(api, deps = {}) {
  return {
    refreshGoldBar() {
      return api.updateEventGoldBar?.(deps);
    },
    resolveEvent(choiceIdx) {
      return api.resolveEvent?.(choiceIdx, deps);
    },
    showCardDiscard(gs, isBurn = false) {
      return api.showCardDiscard?.(gs, isBurn, deps);
    },
    showEvent(event) {
      return api.showEvent?.(event, deps);
    },
    showItemShop(gs) {
      return api.showItemShop?.(gs, deps);
    },
  };
}

export function createEventUiRuntime(deps = {}, callbacks = {}, domActions = {
  openEventItemShop: openEventItemShopRuntime,
  openEventRestSite: openEventRestSiteRuntime,
  openEventShop: openEventShopRuntime,
  renderEventShell: renderEventShellRuntime,
  showEventCardDiscard: showEventCardDiscardOverlay,
}) {
  const gs = getGS(deps);
  const data = getData(deps);
  const doc = getDoc(deps);
  const runRules = getRunRules(deps);
  const audioEngine = getAudioEngine(deps);
  const flowUi = createEventChoiceFlowUi();
  const refreshGoldBar = () => callbacks.refreshGoldBar?.();

  return {
    triggerRandomEvent() {
      return triggerRandomEventService({
        gs,
        data,
        showEvent: callbacks.showEvent,
      });
    },

    showEvent(event) {
      return showEventService({
        event,
        gs,
        doc,
        clearResolveGuards: clearIdempotencyPrefix,
        renderEventShell: domActions.renderEventShell,
        refreshGoldBar,
        resolveEvent: callbacks.resolveEvent,
      });
    },

    resolveEvent(choiceIdx) {
      return resolveEventService({
        choiceIdx,
        gs,
        event: getCurrentEvent(),
        doc,
        deps,
        audioEngine,
        getEventId,
        runIdempotent,
        resolveEventChoiceFlow,
        finishEventFlow,
        flowUi,
        refreshGoldBar,
        resolveEvent: callbacks.resolveEvent,
      });
    },

    createShopEvent() {
      return domActions.openEventShop(deps, {
        gs,
        data,
        runRules,
        showItemShop: callbacks.showItemShop,
      });
    },

    openRestSite() {
      return domActions.openEventRestSite(deps, {
        gs,
        data,
        runRules,
        doc,
        audioEngine,
        showCardDiscard: callbacks.showCardDiscard,
        showEvent: callbacks.showEvent,
      });
    },

    showCardDiscard(gsArg, isBurn = false) {
      return domActions.showEventCardDiscard(gsArg || gs, data, isBurn, deps);
    },

    showItemShop(gsArg) {
      return domActions.openEventItemShop(gsArg, deps, {
        gs,
        data,
        runRules,
        refreshEventGoldBar: refreshGoldBar,
      });
    },
  };
}
