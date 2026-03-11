import { createEventUiFacadeRuntime } from './event_ui_facade_runtime.js';
import {
  getDoc,
  getGS,
  updateEventGoldBarUi,
} from '../../features/event/platform/event_runtime_context.js';

export const EventUI = {
  triggerRandomEvent(deps = {}) {
    return createEventUiFacadeRuntime(this, deps).triggerRandomEvent();
  },

  updateEventGoldBar(deps = {}) {
    const gs = getGS(deps);
    if (!gs?.player) return;
    updateEventGoldBarUi(getDoc(deps), gs.player);
  },

  showEvent(event, deps = {}) {
    return createEventUiFacadeRuntime(this, deps).showEvent(event);
  },

  resolveEvent(choiceIdx, deps = {}) {
    return createEventUiFacadeRuntime(this, deps).resolveEvent(choiceIdx);
  },

  showShop(deps = {}) {
    const runtime = createEventUiFacadeRuntime(this, deps);
    const shop = runtime.createShopEvent();
    if (!shop) return;

    this.showEvent(shop, deps);
  },

  showRestSite(deps = {}) {
    return createEventUiFacadeRuntime(this, deps).openRestSite();
  },

  showCardDiscard(gsArg, isBurn = false, deps = {}) {
    return createEventUiFacadeRuntime(this, deps).showCardDiscard(gsArg, isBurn);
  },

  showItemShop(gsArg, deps = {}) {
    return createEventUiFacadeRuntime(this, deps).showItemShop(gsArg);
  },

  api: {
    showEvent: (event, deps) => EventUI.showEvent(event, deps),
    resolveEvent: (choiceIdx, deps) => EventUI.resolveEvent(choiceIdx, deps),
    showShop: (deps) => EventUI.showShop(deps),
    showRestSite: (deps) => EventUI.showRestSite(deps),
    showItemShop: (gs, deps) => EventUI.showItemShop(gs, deps),
  },
};
