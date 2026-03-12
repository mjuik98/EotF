import { createEventRewardActions } from './app/event_reward_actions.js';
import {
  createEventUiCallbacks,
  createEventUiRuntime,
} from './application/create_event_ui_runtime.js';
import { createEventShopUseCase } from './application/create_event_shop_use_case.js';
import { createRestEventUseCase } from './application/create_rest_event_use_case.js';
import { createDiscardEventCardUseCase, discardEventCard } from './application/discard_event_card_use_case.js';
import { createFinishEventFlowUseCase } from './application/finish_event_flow_use_case.js';
import { buildItemShopStockUseCase, purchaseItemFromShopUseCase } from './application/item_shop_use_case.js';
import { createResolveEventChoiceUseCase } from './application/resolve_event_choice_use_case.js';
import { createResolveEventSessionUseCase } from './application/resolve_event_session_use_case.js';
import { createShowEventSessionUseCase } from './application/show_event_session_use_case.js';
import { buildEventContractBuilders } from './ports/contracts/build_event_contracts.js';
import { buildEventFlowContractBuilders } from './ports/contracts/build_event_flow_contracts.js';
import { createEventRewardPorts } from './ports/create_event_reward_ports.js';
import { EventUI } from './presentation/browser/event_ui.js';
import { buildEventViewModel } from './presentation/event_choice_view_model.js';

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

export function createEventContractCapabilities() {
  return {
    buildEvent: buildEventContractPublicBuilders,
    buildFlow: buildEventFlowContractPublicBuilders,
  };
}

export function createEventRuntimeCapabilities() {
  return {
    createUiCallbacks: createEventUiCallbacks,
    createUiRuntime: createEventUiRuntime,
    createRewardBindings: createEventRewardBindingActions,
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

export function createEventRewardBindingActions(modules, fns, ports = createEventRewardPorts()) {
  return createEventRewardActions(modules, fns, ports);
}

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
  createDiscardEventCardUseCase,
  createEventShopUseCase,
  createEventRewardActions,
  createEventRewardPorts,
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
