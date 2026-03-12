import { createEventRewardActions } from './app/event_reward_actions.js';
import { createEventRewardPorts } from './ports/create_event_reward_ports.js';

export function createEventRewardBindingActions(modules, fns, ports = createEventRewardPorts()) {
  return createEventRewardActions(modules, fns, ports);
}

export {
  createEventRewardActions,
  createEventRewardPorts,
};
