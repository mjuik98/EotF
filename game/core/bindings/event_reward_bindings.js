import { createEventRewardActions } from '../../features/event/app/event_reward_actions.js';
import { createEventRewardPorts } from '../../features/event/ports/create_event_reward_ports.js';

export function createEventRewardBindings(modules, fns) {
    Object.assign(fns, createEventRewardActions(modules, fns, createEventRewardPorts()));
}
