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
} from './event_ui_helpers.js';
import { finishEventFlow, resolveEventChoiceFlow } from './event_ui_flow.js';
import { showEventCardDiscardOverlay } from './event_ui_card_discard.js';
import {
  openEventItemShopRuntime,
  openEventRestSiteRuntime,
  openEventShopRuntime,
  renderEventShellRuntime,
} from './event_ui_runtime_helpers.js';
import { updateEventGoldBar } from './event_ui_dom.js';

export const EventUI = {
  triggerRandomEvent(deps = {}) {
    triggerRandomEventService({
      gs: getGS(deps),
      data: getData(deps),
      showEvent: (event) => this.showEvent(event, deps),
    });
  },

  updateEventGoldBar(deps = {}) {
    const gs = getGS(deps);
    if (!gs?.player) return;
    updateEventGoldBar(getDoc(deps), gs.player);
  },

  showEvent(event, deps = {}) {
    showEventService({
      event,
      gs: getGS(deps),
      doc: getDoc(deps),
      clearResolveGuards: clearIdempotencyPrefix,
      renderEventShell: renderEventShellRuntime,
      refreshGoldBar: () => this.updateEventGoldBar(deps),
      resolveEvent: (choiceIdx) => EventUI.resolveEvent(choiceIdx, deps),
    });
  },

  resolveEvent(choiceIdx, deps = {}) {
    const gs = getGS(deps);
    return resolveEventService({
      choiceIdx,
      gs,
      event: getCurrentEvent(),
      doc: getDoc(deps),
      deps,
      audioEngine: getAudioEngine(deps),
      getEventId,
      runIdempotent,
      resolveEventChoiceFlow,
      finishEventFlow,
      refreshGoldBar: () => this.updateEventGoldBar(deps),
      resolveEvent: (nextChoiceIdx) => EventUI.resolveEvent(nextChoiceIdx, deps),
    });
  },

  showShop(deps = {}) {
    const shop = openEventShopRuntime(deps, {
      gs: getGS(deps),
      data: getData(deps),
      runRules: getRunRules(deps),
      showItemShop: (state) => this.showItemShop(state, deps),
    });
    if (!shop) return;

    this.showEvent(shop, deps);
  },

  showRestSite(deps = {}) {
    openEventRestSiteRuntime(deps, {
      gs: getGS(deps),
      data: getData(deps),
      runRules: getRunRules(deps),
      doc: getDoc(deps),
      audioEngine: getAudioEngine(deps),
      showCardDiscard: (state, isBurn) => this.showCardDiscard(state, isBurn, deps),
      showEvent: (event) => this.showEvent(event, deps),
    });
  },

  showCardDiscard(gsArg, isBurn = false, deps = {}) {
    const gs = gsArg || getGS(deps);
    const data = getData(deps);
    showEventCardDiscardOverlay(gs, data, isBurn, deps);
  },

  showItemShop(gsArg, deps = {}) {
    openEventItemShopRuntime(gsArg, deps, {
      gs: getGS(deps),
      data: getData(deps),
      runRules: getRunRules(deps),
      refreshEventGoldBar: () => this.updateEventGoldBar(deps),
    });
  },

  api: {
    showEvent: (event, deps) => EventUI.showEvent(event, deps),
    resolveEvent: (choiceIdx, deps) => EventUI.resolveEvent(choiceIdx, deps),
    showShop: (deps) => EventUI.showShop(deps),
    showRestSite: (deps) => EventUI.showRestSite(deps),
    showItemShop: (gs, deps) => EventUI.showItemShop(gs, deps),
  },
};
