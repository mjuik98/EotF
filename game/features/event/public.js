import { createEventShopUseCase } from './application/create_event_shop_use_case.js';
import { createRestEventUseCase } from './application/create_rest_event_use_case.js';
import { createDiscardEventCardUseCase, discardEventCard } from './application/discard_event_card_use_case.js';
import { createFinishEventFlowUseCase } from './application/finish_event_flow_use_case.js';
import { buildItemShopStockUseCase, purchaseItemFromShopUseCase } from './application/item_shop_use_case.js';
import { createResolveEventChoiceUseCase } from './application/resolve_event_choice_use_case.js';
import { createResolveEventSessionUseCase } from './application/resolve_event_session_use_case.js';
import { createShowEventSessionUseCase } from './application/show_event_session_use_case.js';
import { createEventContractCapabilities } from './ports/contracts/public_event_contract_capabilities.js';
import { buildEventContractBuilders } from './ports/contracts/build_event_contracts.js';
import { buildEventFlowContractBuilders } from './ports/contracts/build_event_flow_contracts.js';
import {
  createEventRewardBindingActions,
  createEventRuntimeCapabilities,
  createEventUiCallbacks,
  createEventUiRuntime,
} from './ports/runtime/public_event_runtime_surface.js';
import { EventUI } from './presentation/browser/event_ui.js';
import { buildEventViewModel } from './presentation/event_choice_view_model.js';
import { EventManager } from './application/event_manager_compat.js';

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

export function createEventModuleCapabilities() {
  return {
    primary: { EventUI },
  };
}

export function createEventFeatureFacade() {
  return {
    moduleCapabilities: createEventModuleCapabilities(),
    application: createEventApplicationCapabilities(),
    contracts: createEventContractCapabilities(),
    runtime: createEventRuntimeCapabilities(),
  };
}

export const EventPublicSurface = Object.freeze({
  EventManager,
  createEventApplicationCapabilities,
  createEventContractCapabilities,
  createEventFeatureFacade,
  createEventModuleCapabilities,
  createEventRewardBindingActions,
  createEventRuntimeCapabilities,
  createEventShopUseCase,
  createEventUiCallbacks,
  createEventUiRuntime,
  createDiscardEventCardUseCase,
  createFinishEventFlowUseCase,
  createResolveEventChoiceUseCase,
  createResolveEventSessionUseCase,
  createRestEventUseCase,
  createShowEventSessionUseCase,
  EventUI,
  buildEventContractPublicBuilders,
  buildEventFlowContractPublicBuilders,
  buildEventViewModel,
  buildItemShopStockUseCase,
  discardEventCard,
  purchaseItemFromShopUseCase,
});

export function buildEventContractPublicBuilders(ctx) {
  return buildEventContractBuilders(ctx);
}

export function buildEventFlowContractPublicBuilders(ctx) {
  return buildEventFlowContractBuilders(ctx);
}

export {
  buildEventViewModel,
  buildItemShopStockUseCase,
  buildEventContractBuilders,
  buildEventFlowContractBuilders,
  createEventContractCapabilities,
  createEventRewardBindingActions,
  createEventRuntimeCapabilities,
  createDiscardEventCardUseCase,
  createEventShopUseCase,
  createEventUiCallbacks,
  createEventUiRuntime,
  EventUI,
  createFinishEventFlowUseCase,
  createResolveEventChoiceUseCase,
  createResolveEventSessionUseCase,
  createRestEventUseCase,
  createShowEventSessionUseCase,
  discardEventCard,
  purchaseItemFromShopUseCase,
};
