import { pickRandomEvent, resolveEventChoice } from './event_choice_actions.js';
import {
  createRestEvent,
  createShopEvent,
} from './event_shop_actions.js';
import {
  discardEventCard,
  generateItemShopStock,
  purchaseItem,
} from './event_item_shop_actions.js';

export function pickRandomEventAction(gs, data) {
  return pickRandomEvent(gs, data);
}

export function resolveEventChoiceAction(gs, event, choiceIdx, options = {}) {
  return resolveEventChoice(gs, event, choiceIdx, options);
}

export function createShopEventAction(gs, data, runRules, options = {}) {
  return createShopEvent(gs, data, runRules, options);
}

export function createRestEventAction(gs, data, runRules, options = {}) {
  return createRestEvent(gs, data, runRules, options);
}

export function buildItemShopStockAction(gs, data, runRules) {
  return generateItemShopStock(gs, data, runRules);
}

export function purchaseItemFromShopAction(gs, item, cost) {
  return purchaseItem(gs, item, cost);
}

export function discardEventCardAction(gs, cardId, data, isBurn = false) {
  return discardEventCard(gs, cardId, data, isBurn);
}
