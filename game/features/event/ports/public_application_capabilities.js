import { createEventShopUseCase } from '../application/create_event_shop_use_case.js';
import { createRestEventUseCase } from '../application/create_rest_event_use_case.js';
import {
  createDiscardEventCardUseCase,
  discardEventCard,
} from '../application/discard_event_card_use_case.js';
import { createFinishEventFlowUseCase } from '../application/finish_event_flow_use_case.js';
import {
  buildItemShopStockUseCase,
  purchaseItemFromShopUseCase,
} from '../application/item_shop_use_case.js';
import { createResolveEventChoiceUseCase } from '../application/resolve_event_choice_use_case.js';
import { createResolveEventSessionUseCase } from '../application/resolve_event_session_use_case.js';
import { createShowEventSessionUseCase } from '../application/show_event_session_use_case.js';
import { buildEventViewModel } from '../presentation/event_choice_view_model.js';

export function createEventApplicationCapabilities() {
  return {
    createEventShop: createEventShopUseCase,
    createRestEvent: createRestEventUseCase,
    createDiscardEventCard: createDiscardEventCardUseCase,
    createFinishEventFlow: createFinishEventFlowUseCase,
    buildItemShopStock: buildItemShopStockUseCase,
    purchaseItemFromShop: purchaseItemFromShopUseCase,
    createResolveEventChoice: createResolveEventChoiceUseCase,
    createResolveEventSession: createResolveEventSessionUseCase,
    createShowEventSession: createShowEventSessionUseCase,
    buildViewModel: buildEventViewModel,
  };
}

export {
  buildEventViewModel,
  buildItemShopStockUseCase,
  createDiscardEventCardUseCase,
  createEventShopUseCase,
  createFinishEventFlowUseCase,
  createResolveEventChoiceUseCase,
  createResolveEventSessionUseCase,
  createRestEventUseCase,
  createShowEventSessionUseCase,
  discardEventCard,
  purchaseItemFromShopUseCase,
};
