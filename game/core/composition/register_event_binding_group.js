import { createEventRewardBindings } from '../bindings/event_reward_bindings.js';

export function registerEventBindingGroup(modules, fns) {
  createEventRewardBindings(modules, fns);
}
