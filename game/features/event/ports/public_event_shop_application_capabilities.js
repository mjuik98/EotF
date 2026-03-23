import { createEventShopUseCase } from '../application/create_event_shop_use_case.js';
import { createRestEventUseCase } from '../application/create_rest_event_use_case.js';
import {
  buildItemShopStockUseCase,
  purchaseItemFromShopUseCase,
} from '../application/item_shop_use_case.js';

export function buildEventShopApplicationCapabilities() {
  return {
    createEventShop: createEventShopUseCase,
    createRestEvent: createRestEventUseCase,
    buildItemShopStock: buildItemShopStockUseCase,
    purchaseItemFromShop: purchaseItemFromShopUseCase,
  };
}

export {
  buildItemShopStockUseCase,
  createEventShopUseCase,
  createRestEventUseCase,
  purchaseItemFromShopUseCase,
};
