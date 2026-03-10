import { EventManager } from '../../systems/event_manager.js';
import { clearIdempotencyPrefix, runIdempotent } from '../../utils/idempotency_utils.js';
import {
  getAudioEngine,
  getData,
  getDoc,
  getEventId,
  getGS,
  getRunRules,
} from './event_ui_helpers.js';
import { showEventCardDiscardOverlay } from './event_ui_card_discard.js';
import { finishEventFlow, resolveEventChoiceFlow } from './event_ui_flow.js';
import { showEventItemShopOverlay } from './event_ui_item_shop.js';
import { showEventRestSiteOverlay } from './event_ui_rest_site.js';
import { createEventShop } from './event_ui_shop.js';
import { renderChoices, updateEventGoldBar } from './event_ui_dom.js';

let _currentEvent = null;

export const EventUI = {
  triggerRandomEvent(deps = {}) {
    const gs = getGS(deps);
    const data = getData(deps);
    const picked = EventManager.pickRandomEvent(gs, data);
    if (picked) this.showEvent(picked, deps);
  },

  updateEventGoldBar(deps = {}) {
    const gs = getGS(deps);
    if (!gs?.player) return;
    updateEventGoldBar(getDoc(deps), gs.player);
  },

  showEvent(event, deps = {}) {
    const gs = getGS(deps);
    if (!event || !gs) return;

    const doc = getDoc(deps);
    _currentEvent = event;
    gs._eventLock = false;
    clearIdempotencyPrefix('event:resolve:');

    const eyebrowEl = doc.getElementById('eventEyebrow');
    const titleEl = doc.getElementById('eventTitle');
    const descEl = doc.getElementById('eventDesc');
    const imgContEl = doc.getElementById('eventImageContainer');

    if (eyebrowEl) eyebrowEl.textContent = event.eyebrow || 'LAYER 1 EVENT';
    if (titleEl) titleEl.textContent = event.title;
    if (descEl) descEl.textContent = event.desc;
    if (imgContEl) imgContEl.style.display = 'none';

    this.updateEventGoldBar(deps);
    renderChoices(event, doc, gs, (choiceIdx) => EventUI.resolveEvent(choiceIdx, deps));
    doc.getElementById('eventModal')?.classList?.add('active');
  },

  resolveEvent(choiceIdx, deps = {}) {
    const gs = getGS(deps);
    if (!gs) return;
    const event = _currentEvent;
    if (!event) return;
    if (!event.persistent && gs._eventLock) return;

    const guardKey = `event:resolve:${getEventId(event)}:${choiceIdx}`;
    return runIdempotent(guardKey, () => {
      const doc = getDoc(deps);
      return resolveEventChoiceFlow(choiceIdx, {
        gs,
        event,
        doc,
        audioEngine: getAudioEngine(deps),
        deps,
        onResolveChoice: (nextChoiceIdx) => EventUI.resolveEvent(nextChoiceIdx, deps),
        onFinish: () => finishEventFlow(doc, gs, deps, () => {
          _currentEvent = null;
        }),
        onRefreshGoldBar: () => this.updateEventGoldBar(deps),
      });
    }, { ttlMs: 800 });
  },

  showShop(deps = {}) {
    const gs = getGS(deps);
    const data = getData(deps);
    const runRules = getRunRules(deps);
    const shop = createEventShop(gs, data, runRules, deps, {
      showItemShop: (state) => this.showItemShop(state, deps),
    });
    if (!shop) return;

    this.showEvent(shop, deps);
  },

  showRestSite(deps = {}) {
    const gs = getGS(deps);
    const data = getData(deps);
    const runRules = getRunRules(deps);
    showEventRestSiteOverlay(gs, data, runRules, {
      ...deps,
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
    const gs = gsArg || getGS(deps);
    const data = getData(deps);
    const runRules = getRunRules(deps);
    showEventItemShopOverlay(gs, data, runRules, {
      ...deps,
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
