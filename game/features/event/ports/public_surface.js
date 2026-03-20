import { EventManager } from '../compat/event_manager.js';
import { createEventApplicationCapabilities } from './public_application_capabilities.js';
import { createEventContractCapabilities } from './public_contract_capabilities.js';
import { createEventModuleCapabilities } from './public_module_capabilities.js';
import {
  createEventBindingCapabilities as buildEventBindingCapabilities,
  createEventRuntimeCapabilities,
} from './runtime/public_event_runtime_surface.js';

export function createEventBindingCapabilities() {
  return buildEventBindingCapabilities();
}

export function createEventCompatCapabilities() {
  return {
    EventManager,
  };
}

export const EventPublicSurface = Object.freeze({
  get application() {
    return createEventApplicationCapabilities();
  },
  get bindings() {
    return createEventBindingCapabilities();
  },
  get compat() {
    return createEventCompatCapabilities();
  },
  get contracts() {
    return createEventContractCapabilities();
  },
  get moduleCapabilities() {
    return createEventModuleCapabilities();
  },
  get runtime() {
    return createEventRuntimeCapabilities();
  },
});

export {
  createEventApplicationCapabilities,
  createEventContractCapabilities,
  createEventModuleCapabilities,
  createEventRuntimeCapabilities,
};
