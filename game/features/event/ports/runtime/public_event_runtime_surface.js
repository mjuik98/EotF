import {
  createEventUiCallbacks,
  createEventUiRuntime,
} from '../../application/create_event_ui_runtime.js';
import {
  createEventBindingCapabilities,
  createEventRewardBindingActions,
} from '../public_event_binding_surface.js';

export function createEventRuntimeCapabilities() {
  return {
    createUiCallbacks: createEventUiCallbacks,
    createUiRuntime: createEventUiRuntime,
    createRewardBindings: createEventRewardBindingActions,
  };
}

export {
  createEventBindingCapabilities,
  createEventRewardBindingActions,
  createEventUiCallbacks,
  createEventUiRuntime,
};
