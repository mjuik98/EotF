import { createEventRewardActions } from '../../features/event/app/event_reward_actions.js';
import { createEventRewardPorts } from '../../features/event/ports/create_event_reward_ports.js';

export function applyEventRewardBindings({
  modules,
  fns,
  createActions = createEventRewardActions,
  createPorts = createEventRewardPorts,
}) {
  Object.assign(fns, createActions(modules, fns, createPorts()));
  return fns;
}
