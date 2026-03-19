import { createEventRewardActions } from '../platform/browser/create_event_reward_actions.js';
import { createEventRewardPorts } from './create_event_reward_ports.js';

export function createEventRewardBindingActions(modules, fns, ports = createEventRewardPorts()) {
  return createEventRewardActions(modules, fns, ports);
}

export function createEventBindingCapabilities() {
  return {
    createEventRewardBindings: createEventRewardBindingActions,
  };
}
