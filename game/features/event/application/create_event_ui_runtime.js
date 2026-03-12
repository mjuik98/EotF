import {
  getCurrentEvent,
  resolveEventService,
  showEventService,
  triggerRandomEventService,
} from '../../../app/event/event_service.js';
import { clearIdempotencyPrefix, runIdempotent } from '../../../utils/idempotency_utils.js';
import {
  getAudioEngine,
  getData,
  getDoc,
  getEventId,
  getGS,
  getRunRules,
} from '../platform/event_runtime_context.js';
import { finishEventFlow, resolveEventChoiceFlow } from '../app/event_choice_flow_actions.js';
import {
  openEventItemShopRuntime,
  openEventRestSiteRuntime,
  openEventShopRuntime,
  renderEventShellRuntime,
  showEventCardDiscardOverlay,
} from '../platform/event_runtime_dom.js';

export function createEventUiRuntime(api, deps = {}, domActions = {
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
  const refreshGoldBar = () => api.updateEventGoldBar(deps);

  return {
    triggerRandomEvent() {
      return triggerRandomEventService({
        gs,
        data,
        showEvent: (event) => api.showEvent(event, deps),
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
        resolveEvent: (choiceIdx) => api.resolveEvent(choiceIdx, deps),
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
        refreshGoldBar,
        resolveEvent: (nextChoiceIdx) => api.resolveEvent(nextChoiceIdx, deps),
      });
    },

    createShopEvent() {
      return domActions.openEventShop(deps, {
        gs,
        data,
        runRules,
        showItemShop: (state) => api.showItemShop(state, deps),
      });
    },

    openRestSite() {
      return domActions.openEventRestSite(deps, {
        gs,
        data,
        runRules,
        doc,
        audioEngine,
        showCardDiscard: (state, isBurn) => api.showCardDiscard(state, isBurn, deps),
        showEvent: (event) => api.showEvent(event, deps),
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
