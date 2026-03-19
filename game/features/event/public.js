import { createEventApplicationCapabilities } from './ports/public_application_capabilities.js';
import { createEventContractCapabilities } from './ports/public_contract_capabilities.js';
import { createEventModuleCapabilities } from './ports/public_module_capabilities.js';
import {
  createEventBindingCapabilities as buildEventBindingCapabilities,
  createEventRuntimeCapabilities,
} from './ports/runtime/public_event_runtime_surface.js';
import { EventManager } from './application/event_manager_compat.js';

export function createEventBindingCapabilities() {
  return buildEventBindingCapabilities();
}

export function createEventCompatCapabilities() {
  return {
    EventManager,
  };
}

export function createEventFeatureFacade() {
  return {
    moduleCapabilities: createEventModuleCapabilities(),
    application: createEventApplicationCapabilities(),
    bindings: createEventBindingCapabilities(),
    contracts: createEventContractCapabilities(),
    compat: createEventCompatCapabilities(),
    runtime: createEventRuntimeCapabilities(),
  };
}

export const EventPublicSurface = Object.freeze({
  application: createEventApplicationCapabilities(),
  bindings: createEventBindingCapabilities(),
  compat: createEventCompatCapabilities(),
  contracts: createEventContractCapabilities(),
  createEventApplicationCapabilities,
  createEventBindingCapabilities,
  createEventCompatCapabilities,
  createEventContractCapabilities,
  createEventFeatureFacade,
  createEventModuleCapabilities,
  createEventRuntimeCapabilities,
  moduleCapabilities: createEventModuleCapabilities(),
  runtime: createEventRuntimeCapabilities(),
});

export {
  createEventApplicationCapabilities,
  createEventContractCapabilities,
  createEventRuntimeCapabilities,
};
