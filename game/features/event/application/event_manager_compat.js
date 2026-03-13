import {
  pickRandomEventAction,
  resolveEventChoiceAction,
} from '../app/event_manager_actions.js';
import {
  createRestEvent,
  createShopEvent,
  resolveRestResetStagnationChoice,
  resolveRestUpgradeChoice,
  resolveShopCardChoice,
  resolveShopPotionChoice,
  resolveShopUpgradeChoice,
  restResetStagnationDeck,
  restUpgradeCard,
  shopBuyCard,
  shopBuyEnergy,
  shopBuyPotion,
  shopUpgradeCard,
} from '../app/event_shop_actions.js';
import {
  discardEventCard,
  generateItemShopStock,
  purchaseItem,
} from '../app/event_item_shop_actions.js';

export const EventManager = {
  pickRandomEvent(gs, data) {
    return pickRandomEventAction(gs, data);
  },

  resolveEventChoice(gs, event, choiceIdx) {
    return resolveEventChoiceAction(gs, event, choiceIdx);
  },

  createShopEvent(gs, data, runRules, { showItemShopFn } = {}) {
    return createShopEvent(gs, data, runRules, { showItemShopFn });
  },

  createRestEvent(gs, data, runRules, { showCardDiscardFn } = {}) {
    return createRestEvent(gs, data, runRules, { showCardDiscardFn });
  },

  generateItemShopStock(gs, data, runRules) {
    return generateItemShopStock(gs, data, runRules);
  },

  purchaseItem(gs, item, cost) {
    return purchaseItem(gs, item, cost);
  },

  discardCard(gs, cardId, data, isBurn = false) {
    return discardEventCard(gs, cardId, data, isBurn);
  },

  _resolveShopPotionChoice(state, cost) {
    return resolveShopPotionChoice(state, cost);
  },

  _resolveShopCardChoice(state, data, cost) {
    return resolveShopCardChoice(state, data, cost);
  },

  _resolveShopUpgradeChoice(state, data, cost) {
    return resolveShopUpgradeChoice(state, data, cost);
  },

  _resolveRestResetStagnationChoice(state) {
    return resolveRestResetStagnationChoice(state);
  },

  _resolveRestUpgradeChoice(state, data) {
    return resolveRestUpgradeChoice(state, data);
  },

  _shopBuyPotion(state, cost) {
    return shopBuyPotion(state, cost);
  },

  _shopBuyCard(state, data, cost) {
    return shopBuyCard(state, data, cost);
  },

  _shopUpgradeCard(state, data, cost) {
    return shopUpgradeCard(state, data, cost);
  },

  _shopBuyEnergy(state, cost) {
    return shopBuyEnergy(state, cost);
  },

  _restResetStagnationDeck(state) {
    return restResetStagnationDeck(state);
  },

  _restUpgradeCard(state, data) {
    return restUpgradeCard(state, data);
  },
};
