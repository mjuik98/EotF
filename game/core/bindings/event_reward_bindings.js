import { applyEventRewardBindings } from './event_reward_bindings_runtime.js';

export function createEventRewardBindings(modules, fns) {
    return applyEventRewardBindings({ modules, fns });
}
