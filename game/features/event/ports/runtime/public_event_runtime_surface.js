import { createEventRewardActions } from '../../app/event_reward_actions.js';
import {
  createEventUiCallbacks,
  createEventUiRuntime,
} from '../../application/create_event_ui_runtime.js';
import { createEventRewardPorts } from '../create_event_reward_ports.js';

export function createEventRuntimeCapabilities() {
  return {
    createUiCallbacks: createEventUiCallbacks,
    createUiRuntime: createEventUiRuntime,
    createRewardBindings: createEventRewardBindingActions,
  };
}

export function createEventRewardBindingActions(modules, fns, ports = createEventRewardPorts()) {
  return createEventRewardActions(modules, fns, ports);
}

export {
  createEventUiCallbacks,
  createEventUiRuntime,
};
