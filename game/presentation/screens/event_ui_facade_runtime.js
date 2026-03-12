import {
  getCurrentEvent,
  resolveEventService,
  showEventService,
  triggerRandomEventService,
} from '../../app/event/event_service.js';
import { clearIdempotencyPrefix, runIdempotent } from '../../utils/idempotency_utils.js';
import {
  getAudioEngine,
  getData,
  getDoc,
  getEventId,
  getGS,
  getRunRules,
} from '../../features/event/platform/event_runtime_context.js';
import { finishEventFlow, resolveEventChoiceFlow } from '../../features/event/app/event_choice_flow_actions.js';
import {
  openEventItemShopRuntime,
  openEventRestSiteRuntime,
  openEventShopRuntime,
  renderEventShellRuntime,
  showEventCardDiscardOverlay,
} from '../../features/event/platform/event_runtime_dom.js';

export function createEventUiFacadeRuntime(api, deps = {}) {
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
        renderEventShell: renderEventShellRuntime,
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
      return openEventShopRuntime(deps, {
        gs,
        data,
        runRules,
        showItemShop: (state) => api.showItemShop(state, deps),
      });
    },

    openRestSite() {
      return openEventRestSiteRuntime(deps, {
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
      return showEventCardDiscardOverlay(gsArg || gs, data, isBurn, deps);
    },

    showItemShop(gsArg) {
      return openEventItemShopRuntime(gsArg, deps, {
        gs,
        data,
        runRules,
        refreshEventGoldBar: refreshGoldBar,
      });
    },
  };
}
